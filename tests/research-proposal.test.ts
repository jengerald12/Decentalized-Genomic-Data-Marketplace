import { describe, it, expect, beforeEach } from "vitest"

describe("Research Proposal Contract", () => {
  let mockStorage: Map<number, any>
  let proposalNonce: number
  
  beforeEach(() => {
    mockStorage = new Map()
    proposalNonce = 0
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "submit-proposal":
        const [title, description] = args
        proposalNonce++
        mockStorage.set(proposalNonce, {
          researcher: sender,
          title,
          description,
          status: "pending",
        })
        return { success: true, value: proposalNonce }
      case "update-proposal-status":
        const [proposalId, newStatus] = args
        if (sender !== "CONTRACT_OWNER") {
          return { success: false, error: "Not authorized" }
        }
        if (!["approved", "rejected", "completed"].includes(newStatus)) {
          return { success: false, error: "Invalid status" }
        }
        const proposal = mockStorage.get(proposalId)
        if (!proposal) {
          return { success: false, error: "Not found" }
        }
        proposal.status = newStatus
        mockStorage.set(proposalId, proposal)
        return { success: true }
      case "get-proposal":
        return { success: true, value: mockStorage.get(args[0]) }
      case "get-proposal-status":
        const proposalData = mockStorage.get(args[0])
        if (!proposalData) {
          return { success: false, error: "Not found" }
        }
        return { success: true, value: proposalData.status }
      default:
        return { success: false, error: "Method not found" }
    }
  }
  
  it("should submit a proposal", () => {
    const result = mockContractCall("submit-proposal", ["Test Proposal", "Description"], "user1")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
  })
  
  it("should update proposal status", () => {
    mockContractCall("submit-proposal", ["Test Proposal", "Description"], "user1")
    const result = mockContractCall("update-proposal-status", [1, "approved"], "CONTRACT_OWNER")
    expect(result.success).toBe(true)
  })
  
  it("should not allow unauthorized status update", () => {
    mockContractCall("submit-proposal", ["Test Proposal", "Description"], "user1")
    const result = mockContractCall("update-proposal-status", [1, "approved"], "user2")
    expect(result.success).toBe(false)
  })
  
  it("should not allow invalid status", () => {
    mockContractCall("submit-proposal", ["Test Proposal", "Description"], "user1")
    const result = mockContractCall("update-proposal-status", [1, "invalid"], "CONTRACT_OWNER")
    expect(result.success).toBe(false)
  })
  
  it("should get proposal", () => {
    mockContractCall("submit-proposal", ["Test Proposal", "Description"], "user1")
    const result = mockContractCall("get-proposal", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value.title).toBe("Test Proposal")
  })
  
  it("should get proposal status", () => {
    mockContractCall("submit-proposal", ["Test Proposal", "Description"], "user1")
    const result = mockContractCall("get-proposal-status", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toBe("pending")
  })
})

