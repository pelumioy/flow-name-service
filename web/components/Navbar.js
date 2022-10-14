import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import "../flow/config";

export default function Navbar() {
  // Use the AuthContext to get values for the currentUser
  // and helper functions for logIn and logOut
  const { currentUser, logOut, logIn } = useAuth();

  return (
    <>
    <div className="font-semibold justify-between flex  p-3">
        <Link href='/'>
            <a>
                <h1 className="font-bold text-xl text-blue-500">FLOW NAME SERVICE</h1>
            </a>
        </Link>
        <div className="space-x-20 flex">
            <Link href="/Domains">Domains</Link>
            <Link href="/purchase">Purchase</Link>
            <Link href="/manage">Manage</Link>
        </div>
        <button onClick={currentUser.addr ? logOut : logIn} className="rounded-full border px-5 py-1 text-blue-500 border-blue-500">
            {currentUser.addr ? currentUser.addr : "connect wallet"}
        </button>
    </div>
    <hr />
    </>
  );
}