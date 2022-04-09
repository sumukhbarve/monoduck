import { ZodSchema } from 'zod'
import { NoInfer, _ } from './indeps-tapiduck'

interface TapiSockpoint<zData> {
  name: string
  zData: ZodSchema<zData>
}

// Helper for building TapiSockpoints. Implicitly infers ZData.
const sockpoint = function<ZData> (
  sockEventObj: TapiSockpoint<ZData>
): TapiSockpoint<ZData> {
  return sockEventObj
}

// Highly simplified Socket.IO interface, with 'emit' and optional 'on' props.
interface Sockish {
  emit: (evtName: string, eventData: unknown) => void
  on?: (evtName: string, handler: (...args: any[]) => void) => void
}

const sockEmit = function <ZData>(
  sockish: Sockish,
  sockpoint: TapiSockpoint<ZData>,
  data: NoInfer<ZData>
): void {
  const parsed = sockpoint.zData.parse(data)
  sockish.emit(sockpoint.name, parsed)
}

const sockOn = function <ZData>(
  sockish: Required<Sockish>,
  sockpoint: TapiSockpoint<ZData>,
  handler: (data: NoInfer<ZData>) => void
): void {
  if (_.not(sockish.on)) {
    throw new Error("Socket-like object lacks '.on()' method.")
  }
  const wrappedHandler = function (data: NoInfer<ZData>): void {
    const parsed = sockpoint.zData.parse(data)
    handler(parsed)
  }
  sockish.on(sockpoint.name, wrappedHandler)
}

interface BoundTapiSock {
  emit: <ZData>(
    sockpoint: TapiSockpoint<ZData>,
    data: NoInfer<ZData>
  ) => void
  on: <ZData>(
    sockpoint: TapiSockpoint<ZData>,
    handler: (data: NoInfer<ZData>) => void
  ) => void
}

const sockUse = function (sockish: Required<Sockish>): BoundTapiSock {
  const emit = function <ZData>(
    sockpoint: TapiSockpoint<ZData>,
    data: NoInfer<ZData>
  ): void {
    sockEmit(sockish, sockpoint, data)
  }
  const on = function <ZData>(
    sockpoint: TapiSockpoint<ZData>,
    handler: (data: NoInfer<ZData>) => void
  ): void {
    sockOn(sockish, sockpoint, handler)
  }
  return { emit, on }
}

export type { TapiSockpoint, Sockish, BoundTapiSock }
export { sockpoint, sockEmit, sockOn, sockUse }
