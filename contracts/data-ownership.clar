;; Data Ownership Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u401))
(define-constant ERR_ALREADY_EXISTS (err u409))
(define-constant ERR_NOT_FOUND (err u404))

;; Data Maps
(define-map genomic-data
  { owner: principal }
  {
    data-hash: (buff 32),
    metadata: (string-ascii 256),
    is-available: bool
  }
)

;; Public Functions
(define-public (register-data (data-hash (buff 32)) (metadata (string-ascii 256)))
  (let
    ((existing-data (map-get? genomic-data { owner: tx-sender })))
    (asserts! (is-none existing-data) ERR_ALREADY_EXISTS)
    (ok (map-set genomic-data
      { owner: tx-sender }
      {
        data-hash: data-hash,
        metadata: metadata,
        is-available: true
      }
    ))
  )
)

(define-public (update-availability (is-available bool))
  (let
    ((existing-data (unwrap! (map-get? genomic-data { owner: tx-sender }) ERR_NOT_FOUND)))
    (ok (map-set genomic-data
      { owner: tx-sender }
      (merge existing-data { is-available: is-available })
    ))
  )
)

(define-public (update-metadata (new-metadata (string-ascii 256)))
  (let
    ((existing-data (unwrap! (map-get? genomic-data { owner: tx-sender }) ERR_NOT_FOUND)))
    (ok (map-set genomic-data
      { owner: tx-sender }
      (merge existing-data { metadata: new-metadata })
    ))
  )
)

;; Read-only Functions
(define-read-only (get-data-info (owner principal))
  (map-get? genomic-data { owner: owner })
)

(define-read-only (is-data-available (owner principal))
  (match (map-get? genomic-data { owner: owner })
    data (ok (get is-available data))
    (err ERR_NOT_FOUND)
  )
)

