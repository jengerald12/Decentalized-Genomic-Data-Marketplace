;; Access Control Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u401))
(define-constant ERR_NOT_FOUND (err u404))

;; Data Maps
(define-map access-permissions
  { data-owner: principal, accessor: principal }
  { has-access: bool }
)

;; Public Functions
(define-public (grant-access (accessor principal))
  (ok (map-set access-permissions
    { data-owner: tx-sender, accessor: accessor }
    { has-access: true }
  ))
)

(define-public (revoke-access (accessor principal))
  (ok (map-set access-permissions
    { data-owner: tx-sender, accessor: accessor }
    { has-access: false }
  ))
)

;; Read-only Functions
(define-read-only (check-access (data-owner principal) (accessor principal))
  (default-to
    { has-access: false }
    (map-get? access-permissions { data-owner: data-owner, accessor: accessor })
  )
)

