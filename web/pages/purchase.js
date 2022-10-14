import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { checkIsAvailable, getRentCost } from "../flow/scripts";
import { initializeAccount, registerDomain } from "../flow/transactions";

// Maintain a constant for seconds per year
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export default function Purchase() {
  // Use the AuthContext to check whether the connected user is initialized or not
  const { isInitialized, checkInit } = useAuth();
  // State Variable to keep track of the domain name the user wants
  const [name, setName] = useState("");
  // State variable to keep track of how many years 
  // the user wants to rent the domain for
  const [years, setYears] = useState(1);
  // State variable to keep track of the cost of this purchase
  const [cost, setCost] = useState(0.0);
  // Loading state
  const [loading, setLoading] = useState(false);

  // Function to initialize a user's account if not already initialized
  async function initialize() {
    try {
      const txId = await initializeAccount();
        
      // This method waits for the transaction to be mined (sealed)
      await fcl.tx(txId).onceSealed();
      // Recheck account initialization after transaction goes through
      await checkInit();
    } catch (error) {
      console.error(error);
    }
  }

  // Function which calls `registerDomain` 
  async function purchase() {
    try {
      setLoading(true);
      const isAvailable = await checkIsAvailable(name);
      if (!isAvailable) throw new Error("Domain is not available");

      if (years <= 0) throw new Error("You must rent for at least 1 year");
      const duration = (years * SECONDS_PER_YEAR).toFixed(1).toString();
      const txId = await registerDomain(name, duration);
      await fcl.tx(txId).onceSealed();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Function which calculates cost of purchase as user 
  // updates the name and duration
  async function getCost() {
    if (name.length > 0 && years > 0) {
      const duration = (years * SECONDS_PER_YEAR).toFixed(1).toString();
      const c = await getRentCost(name, duration);
      setCost(c);
    }
  }

  // Call getCost() every time `name` and `years` changes
  useEffect(() => {
    getCost();
  }, [name, years]);

  return (
    <div className="px-10 pt-3 h-screen">
      <Head>
        <title>Flow Name Service - Purchase</title>
        <meta name="description" content="Flow Name Service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      {!isInitialized ? (
        <>
          <p>Your account has not been initialized yet</p>
          <button onClick={initialize}>Initialize Account</button>
        </>
      ) : (
        <main className="flex flex-col items-center space-y-5 justify-center pt-40">
            <h1 className="text-4xl font-semibold text-blue-500 text-center pb-10">Purchase a cool new domain name <br/> of your choice</h1>
          <div className="flex-col">
            <span className="font-semibold text-sm">Name: </span>
            <div className="border rounded-lg px-5 py-3 border-blue-500">
                <input className="focus:outline-none"
                type="text"
                value={name}
                placeholder="learnweb3"
                onChange={(e) => setName(e.target.value)}
                />
                <span className=" text-blue-500">.fns</span>
            </div>
          </div>

          <div className="flex-col">
            <span className="font-semibold text-sm">Duration: </span>
            <div className="border rounded-lg px-5 py-3 border-blue-500">
                <input className="focus:outline-none"
                type="number"
                placeholder="1"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                />
                <span className=" text-blue-500 pl-1">yrs</span>
            </div>
          </div>
          <button onClick={purchase} className='rounded-full px-6 py-2 bg-blue-500 text-white'>Purchase</button>
          <p className="text-sm font-semibold text-blue-500">Cost: {cost} FLOW</p>
          <p>{loading ? "Loading..." : null}</p>
        </main>
      )}
    </div>
  );
}