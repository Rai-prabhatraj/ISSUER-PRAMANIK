import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Input } from '@mui/material';

import { useState, useEffect, useContext, useRef } from 'react'

import FormData from 'form-data'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AiOutlineCopy } from 'react-icons/ai';

import { IoIconName } from 'react-icons/io5';
import { ethers } from 'ethers';
import axios from 'axios';
import { contractAddress, contractABI } from './constants'

function Issuer() {
    const [state, setState] = useState({
        provider: null,
        signer: null,
        contract: null,
    })
    const [connected, setConnected] = useState(false)
    const [cid, setCid] = useState('')
    const [signature, setSignature] = useState('')
    const [page, setPage] = useState('sign')
    const [account, setAccount] = useState('')
    const [showSignerInput, setShowSignerInput] = useState(false)
    const [signedTxData, setSignedTxData] = useState([])
    const [receivedTxData, setReceivedTxData] = useState([])
    const [selectedTx, setSelectedTx] = useState(null);


    const closeModal = () => setSelectedTx(null);
    const fileInputRef = useRef(null);
    const receiverRef = useRef(null);
    const messageRef = useRef(null);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(signature)
            .then(() => {
                // Optionally, you can show a success message here
                console.log('Copied to clipboard!');
            })
            .catch((error) => {
                // Handle error if clipboard access fails
                console.error('Failed to copy:', error);
            });
    };

    const handleconnectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });

                // Switching to the correct network
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xaa36a7' }], // chainId must be in hexadecimal
                });

                setAccount(accounts[0]);

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );
                setState({ provider, signer, contract });

                console.log('Connected accounts', accounts);
                setConnected(true); // Set connected to true

            } else {
                alert('Please install Metamask');
            }
        } catch (error) {
            console.log(error);
        }
    };

  
    const handleUploadImg = async () => {
        console.log('Upload image called');

        const formData = new FormData();
        const file = fileInputRef.current?.files[0]; // Access the file using the ref

        console.log('File is: ', file);
        if (!file) {
            console.log('No file uploaded');
            toast.error('Please select the certificate first!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'light',
            });
            return;
        }

        formData.append('file', file);
        console.log(formData);

        console.log('New Pinata IPFS added');
        toast('Uploading...please wait', {
            position: 'top-right',
            autoClose: 7000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
        });

        try {
            const response = await axios.post(
                'https://api.pinata.cloud/pinning/pinFileToIPFS',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        pinata_api_key: 'cc2e560077cf5de826f0',
                        pinata_secret_api_key: '8d8c5864dea3229f5687b88407027a9a2a115073688a630e9be92ed8f7b70946',
                    },
                }
            );
            console.log('IPFS hash generated!');
            console.log(response.data.IpfsHash);
            setCid(response.data.IpfsHash);
            console.log('Content added with CID:', cid);
        } catch (error) {
            console.log(error);
        }
    };


    const handlegetSignature = async () => {
        if (!cid) {
            console.log('cid is', cid)
            console.log('toastify error')
            toast.error('please upload the certificate to IPFS first!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'light',
            })
            return
        }
        const packedMessage = ethers.utils.solidityPack(['string'], [cid])
        console.log('packed msg: ', packedMessage)
        const hash = ethers.utils.keccak256(packedMessage)

        const res = await window.ethereum.request({
            method: 'personal_sign',
            params: [account, hash],
        })
        console.log('signature:', res)
        setSignature(res)
    }

    const handlecheckValidity = async () => {
        let signingAuthority = document.querySelector('#signer').value;
    
        // Remove surrounding quotes, if any
        if (signingAuthority[0] === '"') {
            signingAuthority = signingAuthority.substring(1, signingAuthority.length - 1);
        }
    
        // Validate the signingAuthority as an Ethereum address
        if (!ethers.utils.isAddress(signingAuthority)) {
            console.error('Invalid Ethereum address:', signingAuthority);
            document.querySelector('#valid').innerHTML = `<h1>Invalid Ethereum address</h1>`;
            return;
        }
    
        const msg = document.querySelector('#msg').value;
        const signature = document.querySelector('#signature').value;
    
        try {
            // Call the contract's verify method
            const valid = await state.contract.verify(signingAuthority, msg, signature);
    
            console.log('Signature is', valid);
            document.querySelector('#valid').innerHTML = `<h1>${valid ? 'Valid' : 'Invalid'}</h1>`;
        } catch (error) {
            console.error('Error verifying signature:', error);
            document.querySelector('#valid').innerHTML = `<h1>Error verifying signature</h1>`;
        }
    };
    

    const handlesaveData = async () => {
        const receiver = receiverRef.current?.value; 
        const message = messageRef.current?.value;   
    
        if (!receiver || !message) {
            toast.error('Receiver and message are required!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            return;
        }
    
        console.log(receiver, message, cid);
        console.log(signature);
        console.log(account);
    
        // Notify the user about the blockchain transaction
        toast.info('Transaction submitted to the blockchain!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    
        try {
            // Send data to the blockchain
            const saved = await state.contract.storeSignature(
                account,
                receiver,
                cid.toString(),
                signature,
                message
            );
            await saved.wait();
    
            // Notify user of success
            toast.success('Data successfully stored in blockchain! Check the data section', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
    
            console.log('saveData ', saved);
    
            // POST data to the database
            console.log('Saving data to the database...');
            const response = await fetch("http://localhost:5000/issuer/saveData", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    account,
                    receiver,
                    cid: cid.toString(),
                    signature,
                    message,
                }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to save data to the database");
            }
    
            const result = await response.json();
            console.log('Data saved to the database:', result);
    
            // Notify user of database success
            toast.success('Data successfully stored in database!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        } catch (error) {
            console.log('Error saving data:', error);
    
            // Notify user of failure
            toast.error('Transaction or database operation failed!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };
    

    const handlesetSenderData = async () => {
        console.log('setsenderData is called...!!')
        console.log('account: ', account)
        if (state.contract) {
            console.log('contract is: ', state.contract)
            const senderTxIds =
                await state.contract.retrieveSenderSignaturesTxIds(account)
            console.log(senderTxIds)
            setSignedTxData([])
            await senderTxIds.forEach(async (id) => {
                const transaction = await state.contract.getTransactionById(id)
                setSignedTxData((prev) => [...prev, transaction])
            })
        }
    }

    const handlesetReceiverData = async () => {
        if (state.contract) {
            const receiverTxIds =
                await state.contract.retrieveRecieverSignaturesTxIds(account)

            setReceivedTxData([])
            console.log('receiverTxIds', receiverTxIds)
            await receiverTxIds.forEach(async (id) => {
                const transaction = await state.contract.getTransactionById(id)
                setReceivedTxData((prev) => [...prev, transaction])
            })
        }
    }

    const handlegetSignerAddress = async () => {
        const msg = document.querySelector('#msg').value
        const signature = document.querySelector('#signature').value
        const signerAddress = await state.contract.getSigner(msg, signature)
        console.log('signature is', signerAddress)
        document.querySelector('#valid').innerHTML = `<h1>${signerAddress}</h1>`
    }

    return (
        <Box sx={{ backgroundColor: 'white', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', boxShadow: 1, p: 2 }}>
                <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold', color: 'text.primary' }}>ISSUE DOCUMENT</Typography>
                <Button
                onClick={handleconnectWallet}
                variant="contained"
                color="primary"
                sx={{
                    m: 2,
                    px: 4,
                    py: 2,
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'primary.dark' },
                }}
            >
                {connected ? 'Wallet Connected' : 'Connect Wallet'}
            </Button>
            </Box>

            {connected ? (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }} />
                    

                    {page === 'sign' && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'gray.50' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 600, bgcolor: 'white', borderRadius: 2, boxShadow: 3, p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>Sign and Save Certificate</Typography>

                                {/* Step 1: Upload File */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Upload the File</Typography>
                                    {cid ? (
                                        <Box sx={{ p: 2, bgcolor: 'gray.100', borderRadius: 1 }}>
                                            <Typography variant="body2"><strong>CID: </strong>{cid}</Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                                            <TextField
                                                     type="file"
                                                     inputRef={fileInputRef}  // Attach ref here
                                                     sx={{ flex: 1 }}
                                                 />
                                                 <Button
                                                     onClick={handleUploadImg}
                                                     variant="contained"
                                                     color="primary"
                                                     sx={{ alignSelf: 'flex-start', marginTop: 2 }}
                                                 >
                                                     Upload to IPFS
                                                 </Button>
                                        </Box>
                                    )}
                                </Box>

                                {/* Step 2: Sign the CID */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Sign the CID (Issuing Authority Signature)</Typography>
                                    {signature ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'gray.100', borderRadius: 1 }}>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-word', flex: 1 }}>
                                                {signature.slice(0, 20)}...
                                            </Typography>
                                            <Box
                                             onClick={handleCopyToClipboard}
                                                sx={{ cursor: 'pointer', color: 'primary.main' }}
                                                     >
                                                <AiOutlineCopy size={20} />
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Button
                                            onClick={handlegetSignature}
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                        >
                                            Sign the CID
                                        </Button>
                                    )}
                                </Box>

                                {/* Step 3: Enter Details */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Enter Receiver and Certificate Details</Typography>
                                    <input
    label="Receiver Address"
    variant="outlined"
    id="receiver"
    ref={receiverRef}
    required
    fullWidth
    margin="normal"
/>
<input
    label="Message"
    variant="outlined"
    id="message"
    ref={messageRef}
    required
    fullWidth
    margin="normal"
/>
                                </Box>

                                {/* Step 4: Save to Blockchain */}
                                <Box>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Issue Document:</Typography>
                                    {signature && (
                                           <Button
                                           onClick={handlesaveData}
                                           variant="contained"
                                           color="success"
                                           fullWidth
                                       >
                                           Save
                                       </Button>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {page === 'verify' && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'gray.50' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 600, bgcolor: 'white', borderRadius: 2, boxShadow: 3, p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>Verify Signature</Typography>

                                {/* CID Input */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Enter CID</Typography>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Signed message"
                                    />
                                </Box>

                                {/* Signature Input */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Enter Signature</Typography>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Signature"
                                    />
                                </Box>

                                {/* Signer Address Input */}
                                {showSignerInput && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Enter Signer Address</Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Signing authority"
                                        />
                                    </Box>
                                )}

                                {/* Action Buttons */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {!showSignerInput ? (
                                        <Button
                                            onClick={handlegetSignerAddress}
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            sx={{ mb: 2 }}
                                        >
                                            Get the Signer Address
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handlecheckValidity}
                                            variant="contained"
                                            color="success"
                                            fullWidth
                                            sx={{ mb: 2 }}
                                        >
                                            Confirm Address Validity
                                        </Button>
                                    )}
                                    <Typography id="valid" sx={{ fontSize: 18, fontWeight: 'medium', color: 'text.secondary' }} />
                                </Box>

                                {/* Toggle Option */}
                                <Box sx={{ textAlign: 'center' }}>
                                    {!showSignerInput ? (
                                        <Typography
                                            variant="body2"
                                            sx={{ color: 'primary.main', cursor: 'pointer' }}
                                            onClick={() => setShowSignerInput(true)}
                                        >
                                            Already have the signer address? Try this
                                        </Typography>
                                    ) : (
                                        <Typography
                                            variant="body2"
                                            sx={{ color: 'primary.main', cursor: 'pointer' }}
                                            onClick={() => setShowSignerInput(false)}
                                        >
                                            Want to provide the CID? Try this
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <Typography variant="h6">Connect your wallet to continue</Typography>
                </Box>
            )}

            <ToastContainer position="top-right" />
        </Box>
    )

      
}

export default Issuer
