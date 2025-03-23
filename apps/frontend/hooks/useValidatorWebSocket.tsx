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
  const { publicKey, signMessage, connected: walletConnected } = useWallet();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const validatorIdRef = useRef<string | null>(null);
  const [state, setState] = useState<ValidatorWebSocketState>({
    connected: false,
    validatorId: null,
    error: null,
    pendingPayouts: null,
    websitesValidated: 0,
  });
  const [walletStatus, setWalletStatus] = useState("disconnected");

  useEffect(() => {
    if (!publicKey || !signMessage || !walletConnected) return;
    
    const timer = setTimeout(() => {
      try {
        console.log("Connecting to WebSocket after delay...");
        const ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
          console.log("WebSocket connection established");
          setState((prev) => ({ ...prev, connected: true, error: null }));
        };
        
        ws.onclose = () => {
          console.log("WebSocket closed");
          setState((prev) => ({ ...prev, connected: false }));
        };
        
        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setState((prev) => ({ 
            ...prev, 
            error: "WebSocket connection error. Please refresh the page." 
          }));
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
                if (!signatureBytes || signatureBytes.length === 0) {
                  throw new Error("User rejected signature");
                }
                signature = JSON.stringify(Array.from(signatureBytes));
              } catch (error) {
                console.error("Error signing validation message:", error);
                const errorMessage = typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && 
                  (error.message.includes("reject") || error.message.includes("declined")) ? 
                  "You rejected the signature request. Please accept to validate websites." : 
                  "Failed to sign validation message";
                setState(prev => ({ ...prev, error: errorMessage }));
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
      } catch (error) {
        console.error("Error creating WebSocket:", error);
        setState(prev => ({ 
          ...prev, 
          error: "Failed to connect to validation server" 
        }));
      }
    }, 2000); // 2-second delay to ensure everything is ready
    
    return () => {
      clearTimeout(timer);
      if (socket) {
        socket.close();
      }
    };
  }, [publicKey, signMessage, walletConnected]);

  // Check wallet health
  useEffect(() => {
    if (!publicKey) {
      setWalletStatus("disconnected");
    } else if (!signMessage) {
      setWalletStatus("connected_no_signing");
    } else if (walletConnected) {
      setWalletStatus("ready");
    } else {
      setWalletStatus("connected_not_ready");
    }
  }, [publicKey, signMessage, walletConnected]);

  // Force wallet reconnect
  const reconnectWallet = useCallback(() => {
    // Force disconnect first
    setState(prev => ({ ...prev, error: "Attempting to reconnect wallet..." }));
    
    // Add a slight delay before page reload to ensure the message is shown
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }, []);
  
  // Simple reconnect function
  const reconnect = useCallback(() => {
    window.location.reload();
  }, []);

  // Function to register as a validator
  const registerValidator = useCallback(async () => {
    if (!socket || !publicKey || !signMessage) {
      setState(prev => ({ ...prev, error: "Cannot register: wallet not connected. Please connect your wallet first." }));
      return;
    }
    
    if (socket.readyState !== WebSocket.OPEN) {
      setState(prev => ({ ...prev, error: "Cannot register: server connection not ready. Try refreshing the page." }));
      return;
    }

    // Add additional check to ensure wallet is still connected
    if (!walletConnected) {
      setState(prev => ({ ...prev, error: "Wallet connection lost. Please reconnect your wallet and try again." }));
      return;
    }

    if (walletStatus !== "ready") {
      setState(prev => ({ ...prev, error: `Wallet not ready to sign (${walletStatus}). Try reconnecting your wallet.` }));
      return;
    }

    try {
      console.log("Attempting to register validator...");
      const callbackId = uuidv4();
      const messageToSign = `Signed message for ${callbackId} ${publicKey.toBase58()}`;
      
      let signatureBytes;
      try {
        signatureBytes = await signMessage(new TextEncoder().encode(messageToSign));
        if (!signatureBytes || signatureBytes.length === 0) {
          throw new Error("User rejected signature");
        }
        
      } catch (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' &&
          (error.message.includes("reject") || error.message.includes("declined")) ? 
          "You rejected the signature request. Please try again and approve the signature to register as a validator." : 
          "Failed to sign registration message. Please try again.";
        setState(prev => ({ ...prev, error: errorMessage }));
        return;
      }

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
  }, [socket, publicKey, signMessage, walletConnected, walletStatus]);

  return {
    ...state,
    registerValidator,
    reconnect,
    reconnectWallet,
    walletStatus
  };
};

export default useValidatorWebSocket; 