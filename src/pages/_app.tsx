import "@/styles/globals.css";
import type { AppProps } from "next/app";
import YandexMetrika from '../components/Metrica'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <YandexMetrika />
      <Component {...pageProps} />
    </>
  )
}