import { describe, it, expect, beforeEach } from "vitest"

describe("Access Control Contract", () => {
  let mockStorage: Map<string, any>
  
  beforeEach(() => {
    mockStorage = new Map()
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "grant-access":
        const [accessor] = args
        const key = `${sender}-${accessor}`
        mockStorage.set(key, { hasAccess: true })
        return { success: true }
      case "revoke-access":
        const [revokeAccessor] = args
        const revokeKey = `${sender}-${revokeAccessor}`
        mockStorage.set(revokeKey, { hasAccess: false })
        return { success: true }
      case "check-access":
        const [dataOwner, checkAccessor] = args
        const checkKey = `${dataOwner}-${checkAccessor}`
        return { success: true, value: mockStorage.get(checkKey) || { hasAccess: false } }
      default:
        return { success: false, error: "Method not found" }
    }
  }
  
  it("should grant access", () => {
    const result = mockContractCall("grant-access", ["user2"], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should revoke access", () => {
    mockContractCall("grant-access", ["user2"], "user1")
    const result = mockContractCall("revoke-access", ["user2"], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should check access", () => {
    mockContractCall("grant-access", ["user2"], "user1")
    const result = mockContractCall("check-access", ["user1", "user2"], "anyone")
    expect(result.success).toBe(true)
    expect(result.value.hasAccess).toBe(true)
  })
  
  it("should return false for non-existent access", () => {
    const result = mockContractCall("check-access", ["user1", "user3"], "anyone")
    expect(result.success).toBe(true)
    expect(result.value.hasAccess).toBe(false)
  })
})
