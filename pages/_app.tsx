import "@/styles/globals.scss";
import 'react-photo-view/dist/react-photo-view.css';
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
