import Head from "next/head";
import Link from "next/link";
import Navbar from "../components/Navbar";


export default function Home() {

  return (
    <div className="px-10 pt-3 h-screen">
      <Head>
        <title>Flow Name Service</title>
        <meta name="description" content="Flow Name Service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <Navbar />

        <div className="flex flex-col items-center justify-center pt-40">
          <h1 className="text-4xl font-semibold text-blue-500 text-center">Decentralised naming for your <br/> wallets on the flow network</h1>
          <h2 className="pt-5 pb-5"> No more boring, hard to read wallet addresses</h2>
          <Link href='/purchase'>
            <a>
              <button className="bg-blue-500 text-white px-10 rounded-full py-5 text-lg">Get your first name here</button>
            </a>
          </Link>
        </div>
    </div>
  );
}