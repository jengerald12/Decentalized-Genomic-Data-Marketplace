;; Research Proposal Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u401))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_INVALID_STATUS (err u400))

;; Data Maps
(define-map research-proposals
  { proposal-id: uint }
  {
    researcher: principal,
    title: (string-ascii 100),
    description: (string-ascii 500),
    status: (string-ascii 20)
  }
)

(define-data-var proposal-nonce uint u0)

;; Public Functions
(define-public (submit-proposal (title (string-ascii 100)) (description (string-ascii 500)))
  (let
    ((new-proposal-id (+ (var-get proposal-nonce) u1)))
    (map-set research-proposals
      { proposal-id: new-proposal-id }
      {
        researcher: tx-sender,
        title: title,
        description: description,
        status: "pending"
      }
    )
    (var-set proposal-nonce new-proposal-id)
    (ok new-proposal-id)
  )
)

(define-public (update-proposal-status (proposal-id uint) (new-status (string-ascii 20)))
  (let
    ((proposal (unwrap! (map-get? research-proposals { proposal-id: proposal-id }) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (or (is-eq new-status "approved") (is-eq new-status "rejected") (is-eq new-status "completed")) ERR_INVALID_STATUS)
    (ok (map-set research-proposals
      { proposal-id: proposal-id }
      (merge proposal { status: new-status })
    ))
  )
)

;; Read-only Functions
(define-read-only (get-proposal (proposal-id uint))
  (map-get? research-proposals { proposal-id: proposal-id })
)

(define-read-only (get-proposal-status (proposal-id uint))
  (match (map-get? research-proposals { proposal-id: proposal-id })
    proposal (ok (get status proposal))
    (err ERR_NOT_FOUND)
  )
)

