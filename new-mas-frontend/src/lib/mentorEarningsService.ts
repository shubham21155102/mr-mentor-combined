const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

export interface MentorEarnings {
  totalEarnings: number
  availableBalance: number
  withdrawnAmount: number
  lastTransaction?: MentorTransaction
}

export interface MentorTransaction {
  id: string
  mentorId: string
  type: 'earning' | 'withdrawal'
  amount: number
  status?: 'requested' | 'in_process' | 'completed' | 'cancelled'
  description?: string
  bankUPI?: string
  transactionId?: string
  paymentMethod?: 'UPI' | 'Bank'
  slotId?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface PaymentHistoryResponse {
  transactions: MentorTransaction[]
  total: number
  currentPage: number
  totalPages: number
}

export class MentorEarningsService {
  /**
   * Get mentor earnings summary
   */
  static async getMentorEarnings(token: string): Promise<MentorEarnings> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mentor/earnings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch mentor earnings: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error fetching mentor earnings:', error)
      throw error
    }
  }

  /**
   * Request withdrawal
   */
  static async requestWithdrawal(
    token: string,
    amount: number,
    paymentMethod: 'UPI' | 'Bank',
    bankUPI: string
  ): Promise<{ success: boolean; message: string; transaction?: MentorTransaction }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mentor/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          paymentMethod,
          bankUPI
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request withdrawal')
      }

      return data
    } catch (error) {
      console.error('Error requesting withdrawal:', error)
      throw error
    }
  }

  /**
   * Get payment history with pagination
   */
  static async getPaymentHistory(
    token: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaymentHistoryResponse> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mentor/payment-history?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch payment history: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error fetching payment history:', error)
      throw error
    }
  }
}
