import Footer from "../components/Footer";
import AuthProvider from "../contexts/AuthContext";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Footer />
    </AuthProvider>
  );
}

export default MyApp;
