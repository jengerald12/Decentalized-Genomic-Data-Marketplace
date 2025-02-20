import { describe, it, expect, beforeEach } from "vitest"

describe("Data Ownership Contract", () => {
  let mockStorage: Map<string, any>
  
  beforeEach(() => {
    mockStorage = new Map()
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "register-data":
        const [dataHash, metadata] = args
        if (mockStorage.has(sender)) {
          return { success: false, error: "Already exists" }
        }
        mockStorage.set(sender, { dataHash, metadata, isAvailable: true })
        return { success: true }
      case "update-availability":
        const [isAvailable] = args
        if (!mockStorage.has(sender)) {
          return { success: false, error: "Not found" }
        }
        const data = mockStorage.get(sender)
        data.isAvailable = isAvailable
        mockStorage.set(sender, data)
        return { success: true }
      case "update-metadata":
        const [newMetadata] = args
        if (!mockStorage.has(sender)) {
          return { success: false, error: "Not found" }
        }
        const existingData = mockStorage.get(sender)
        existingData.metadata = newMetadata
        mockStorage.set(sender, existingData)
        return { success: true }
      case "get-data-info":
        return { success: true, value: mockStorage.get(args[0]) }
      case "is-data-available":
        const ownerData = mockStorage.get(args[0])
        if (!ownerData) {
          return { success: false, error: "Not found" }
        }
        return { success: true, value: ownerData.isAvailable }
      default:
        return { success: false, error: "Method not found" }
    }
  }
  
  it("should register data", () => {
    const result = mockContractCall("register-data", ["0x1234", "Sample metadata"], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should not register data twice", () => {
    mockContractCall("register-data", ["0x1234", "Sample metadata"], "user1")
    const result = mockContractCall("register-data", ["0x5678", "New metadata"], "user1")
    expect(result.success).toBe(false)
  })
  
  it("should update availability", () => {
    mockContractCall("register-data", ["0x1234", "Sample metadata"], "user1")
    const result = mockContractCall("update-availability", [false], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should update metadata", () => {
    mockContractCall("register-data", ["0x1234", "Sample metadata"], "user1")
    const result = mockContractCall("update-metadata", ["Updated metadata"], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should get data info", () => {
    mockContractCall("register-data", ["0x1234", "Sample metadata"], "user1")
    const result = mockContractCall("get-data-info", ["user1"], "anyone")
    expect(result.success).toBe(true)
    expect(result.value.dataHash).toBe("0x1234")
  })
  
  it("should check if data is available", () => {
    mockContractCall("register-data", ["0x1234", "Sample metadata"], "user1")
    const result = mockContractCall("is-data-available", ["user1"], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toBe(true)
  })
})

