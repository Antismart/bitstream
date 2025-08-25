"use client"

import React from "react"
import { IdentityKitProvider } from "@nfid/identitykit/react"

// Import IdentityKit styles
import "@nfid/identitykit/react/styles.css"

interface IdentityKitWrapperProps {
  children: React.ReactNode
}

// IdentityKit wrapper - now with compatible @dfinity v2.4.0 packages
export function IdentityKitWrapper({ children }: IdentityKitWrapperProps) {
  return (
    <IdentityKitProvider
      signerClientOptions={{
        targets: ["35epn-uiaaa-aaaag-aufsq-cai"], // Your backend canister ID
      }}
    >
      {children}
    </IdentityKitProvider>
  )
}