/**
 * Utility function for retrying failed operations with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryableErrors?: string[]
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_ERROR']
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry configuration options
 * @returns Promise with the result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // Check if this is the last attempt
      if (attempt === config.maxRetries) {
        break
      }
      
      // Check if error is retryable
      const errorMessage = error instanceof Error ? error.message : String(error)
      const isRetryable = config.retryableErrors.some(retryableError => 
        errorMessage.toUpperCase().includes(retryableError)
      )
      
      if (!isRetryable) {
        break
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffFactor, attempt),
        config.maxDelay
      )
      
      // Add jitter (±20%) to prevent thundering herd
      const jitter = delay * 0.2 * (Math.random() * 2 - 1)
      const actualDelay = Math.max(100, delay + jitter)
      
      console.warn(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${actualDelay}ms:`, errorMessage)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, actualDelay))
    }
  }
  
  throw lastError
}

/**
 * Check if the browser is online
 * @returns boolean indicating online status
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine
}

/**
 * Create a timeout promise
 * @param ms Timeout in milliseconds
 * @param message Error message for timeout
 * @returns Promise that rejects after timeout
 */
export function timeout<T>(promise: Promise<T>, ms: number, message = 'Operation timed out'): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms)
  })
  
  return Promise.race([promise, timeoutPromise])
}

/**
 * Retry with timeout wrapper
 * @param fn Function to retry
 * @param timeoutMs Timeout in milliseconds
 * @param retryOptions Retry options
 * @returns Promise with the result
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return retryWithBackoff(async () => {
    return timeout(fn(), timeoutMs)
  }, retryOptions)
}

/**
 * Network-aware retry that checks online status
 * @param fn Function to retry
 * @param options Retry options
 * @returns Promise with the result
 */
export async function networkAwareRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  if (!isOnline()) {
    throw new Error('NETWORK_ERROR: Device is offline')
  }
  
  return retryWithBackoff(fn, options)
}

/**
 * Cache with retry for expensive operations
 */
export class RetryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>()
  private defaultTTL: number
  
  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL
  }
  
  async get(
    key: string,
    fetcher: () => Promise<T>,
    options: RetryOptions & { ttl?: number } = {}
  ): Promise<T> {
    const cached = this.cache.get(key)
    const now = Date.now()
    const ttl = options.ttl || this.defaultTTL
    
    // Return cached data if valid
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.data
    }
    
    // Fetch fresh data with retry
    const data = await retryWithBackoff(fetcher, options)
    
    // Update cache
    this.cache.set(key, { data, timestamp: now })
    
    return data
  }
  
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}

// Export a default instance for common use
export const defaultRetryCache = new RetryCache()