import React, { useState, useEffect } from "react";
import "./styles.css";
import { Magic } from "magic-sdk";
import { NearExtension } from "@magic-ext/near";
import { transactions, utils } from 'near-api-js'

const magic = new Magic('pk_test_E52D701487E9A4DA', {
    extensions: [
        new NearExtension({
            rpcUrl: '',
        }),
    ]});

export default function App() {
    const [email, setEmail] = useState("");
    const [publicAddress, setPublicAddress] = useState("");
    const [destinationAddress, setDestinationAddress] = useState("");
    const [sendAmount, setSendAmount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userMetadata, setUserMetadata] = useState({});
    const [txHash, setTxHash] = useState("");
    const [sendingTransaction, setSendingTransaction] = useState(false);

    useEffect(() => {
        magic.user.isLoggedIn().then(async (magicIsLoggedIn) => {
            setIsLoggedIn(magicIsLoggedIn);
            if (magicIsLoggedIn) {
                const metadata = await magic.user.getMetadata();
                setPublicAddress(metadata.publicAddress);
                setUserMetadata(metadata);
            }
        });
    }, [isLoggedIn]);

    const login = async () => {
        await magic.auth.loginWithMagicLink({ email });
        setIsLoggedIn(true);
    };

    const logout = async () => {
        await magic.user.logout();
        setIsLoggedIn(false);
    };

    const handleSignTransaction = async () => {
        const publicKeyString = await magic.near.getPublicKey();

        const publicKey = utils.PublicKey.fromString(publicKeyString);

        const actions = [
            transactions.transfer(sendAmount)
        ];
        const transaction = transactions.createTransaction(publicAddress, publicKey, destinationAddress, 0, actions, '9av2U6cova7LZPA9NPij6CTUrpBbgPG6');

        const rawTransaction = transaction.encode();

        const result = await magic.near.signTransaction({rawTransaction, networkID: 'testenet'});

        const signedTransaction = transactions.SignedTransaction.decode(Buffer.from(result.encodedSignedTransaction));

        console.log('signedTransaction', signedTransaction)
    };

    return (
        <div className="App">
            {!isLoggedIn ? (
                <div className="container">
                    <h1>Please sign up or login</h1>
                    <input
                        type="email"
                        name="email"
                        required="required"
                        placeholder="Enter your email"
                        onChange={(event) => {
                            setEmail(event.target.value);
                        }}
                    />
                    <button onClick={login}>Send</button>
                </div>
            ) : (
                <div>
                    <div className="container">
                        <h1>Current user: {userMetadata.email}</h1>
                        <button onClick={logout}>Logout</button>
                    </div>
                    <div className="container">
                        <h1>Near account id</h1>
                        <div className="info">{publicAddress}</div>
                    </div>
                    <div className="container">
                        <h1>Sign Near Transaction</h1>
                        {txHash ? (
                            <div>
                                <div>Sign transaction success</div>
                                <div className="info">{txHash}</div>
                            </div>
                        ) : sendingTransaction ? (
                            <div className="sending-status">Signing transaction</div>
                        ) : (
                            <div />
                        )}
                        <input
                            type="text"
                            name="destination"
                            className="full-width"
                            required="required"
                            placeholder="Destination address"
                            onChange={(event) => {
                                setDestinationAddress(event.target.value);
                            }}
                        />
                        <input
                            type="text"
                            name="amount"
                            className="full-width"
                            required="required"
                            placeholder="Amount in Near"
                            onChange={(event) => {
                                setSendAmount(event.target.value);
                            }}
                        />
                        <button id="btn-send-txn" onClick={handleSignTransaction}>
                            Sign Transaction
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}