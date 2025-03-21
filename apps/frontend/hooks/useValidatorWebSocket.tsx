"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { v4 as uuidv4 } from "uuid";
import nacl from "tweetnacl";

interface ValidatorWebSocketState {
  connected: boolean;
  validatorId: string | null;
  error: string | null;
  pendingPayouts: number | null;
  websitesValidated: number | null;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

const useValidatorWebSocket = () => {
  const { publicKey, signMessage } = useWallet();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const validatorIdRef = useRef<string | null>(null);
  const [state, setState] = useState<ValidatorWebSocketState>({
    connected: false,
    validatorId: null,
    error: null,
    pendingPayouts: null,
    websitesValidated: 0,
  });

  useEffect(() => {
    if (!publicKey || !signMessage) return;
    
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      setState((prev) => ({ ...prev, connected: true }));
    };
    
    ws.onclose = () => {
      setState((prev) => ({ ...prev, connected: false }));
    };
    
    ws.onerror = (error) => {
      setState((prev) => ({ ...prev, error: "WebSocket connection error" }));
    };
    
    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        
        if (data.type === 'signup') {
          console.log("Signup response received:", data);
          const validatorIdValue = data.validatorId || (data.data && data.data.validatorId);
          
          if (validatorIdValue) {
            validatorIdRef.current = validatorIdValue;
            setState((prev) => ({ 
              ...prev, 
              validatorId: validatorIdValue,
              error: null
            }));
            console.log("State updated with validatorId:", validatorIdValue);
          } else {
            console.error("No validatorId found in signup response:", data);
            setState((prev) => ({ ...prev, error: "Invalid signup response from server" }));
          }
        } else if (data.type === 'validate') {
          const validateData = data.data;
          const startTime = Date.now();
          const messageToSign = `Replying to ${validateData.callbackId}`;
          
          let signature;
          try {
            const signatureBytes = await signMessage(new TextEncoder().encode(messageToSign));
            signature = JSON.stringify(Array.from(signatureBytes));
          } catch (error) {
            console.error("Error signing validation message:", error);
            setState(prev => ({ ...prev, error: "Failed to sign validation message" }));
            return;
          }
          
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL}/api/proxy`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ url: validateData.url })
            });
            const endTime = Date.now();
            const latency = endTime - startTime;
            const status = response.status;
            ws.send(JSON.stringify({
              type: "validate",
              data: {
                callbackId: validateData.callbackId,
                latency,
                status: status === 200 ? "ONLINE" : "DOWN",
                validatorId: validatorIdRef.current,
                websiteId: validateData.websiteId,
                signedMessage: signature
              }
            }));
            
            setState(prev => ({
              ...prev,
              websitesValidated: (prev.websitesValidated || 0) + 1
            }));
          } catch (error) {
            // Site is down or unreachable - using same logic as validator
            ws.send(JSON.stringify({
              type: "validate",
              data: {
                callbackId: validateData.callbackId,
                latency: 999,
                status: "DOWN",
                validatorId: validatorIdRef.current,
                websiteId: validateData.websiteId,
                signedMessage: signature
              }
            }));
            
            setState(prev => ({
              ...prev,
              websitesValidated: (prev.websitesValidated || 0) + 1
            }));
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, [publicKey, signMessage]);

  // Function to register as a validator
  const registerValidator = useCallback(async () => {
    if (!socket || !publicKey || !signMessage || socket.readyState !== WebSocket.OPEN) {
      setState(prev => ({ ...prev, error: "Cannot register: connection or wallet not ready" }));
      return;
    }

    try {
      console.log("Attempting to register validator...");
      const callbackId = uuidv4();
      const messageToSign = `Signed message for ${callbackId} ${publicKey.toBase58()}`;
      
      let signatureBytes;
      try {
        signatureBytes = await signMessage(new TextEncoder().encode(messageToSign));
      } catch (error) {
        console.error("Error signing registration message:", error);
        setState(prev => ({ ...prev, error: "Failed to sign registration message. Please approve the signature request." }));
        return;
      }

      // Get IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ip = ipData.ip;

      const signupMessage = {
        type: 'signup',
        data: {
          callbackId,
          ip,
          publicKey: publicKey.toBase58(),
          signedMessage: JSON.stringify(Array.from(signatureBytes))
        }
      };
      
      console.log("Sending signup message:", signupMessage);
      socket.send(JSON.stringify(signupMessage));

    } catch (error) {
      console.error("Error during validator registration:", error);
      setState(prev => ({ ...prev, error: "Registration failed: " + (error instanceof Error ? error.message : String(error)) }));
    }
  }, [socket, publicKey, signMessage]);

  return {
    ...state,
    registerValidator
  };
};

export default useValidatorWebSocket; 