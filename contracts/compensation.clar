;; Compensation Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u401))
(define-constant ERR_INSUFFICIENT_FUNDS (err u402))
(define-constant ERR_NOT_FOUND (err u404))

;; Fungible Token Definition
(define-fungible-token genomic-token u1000000000)

;; Data Maps
(define-map payments
  { payment-id: uint }
  {
    from: principal,
    to: principal,
    amount: uint,
    proposal-id: uint
  }
)

(define-data-var payment-nonce uint u0)

;; Public Functions
(define-public (mint-tokens (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (ft-mint? genomic-token amount recipient)
  )
)

(define-public (transfer-tokens (amount uint) (recipient principal))
  (ft-transfer? genomic-token amount tx-sender recipient)
)

(define-public (pay-for-data-usage (data-owner principal) (amount uint) (proposal-id uint))
  (let
    ((new-payment-id (+ (var-get payment-nonce) u1)))
    (try! (ft-transfer? genomic-token amount tx-sender data-owner))
    (map-set payments
      { payment-id: new-payment-id }
      {
        from: tx-sender,
        to: data-owner,
        amount: amount,
        proposal-id: proposal-id
      }
    )
    (var-set payment-nonce new-payment-id)
    (ok new-payment-id)
  )
)

;; Read-only Functions
(define-read-only (get-balance (account principal))
  (ft-get-balance genomic-token account)
)

(define-read-only (get-payment-info (payment-id uint))
  (map-get? payments { payment-id: payment-id })
)

