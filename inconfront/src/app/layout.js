import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "./store";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "InconData",
  description: "Aplicación integral para la gestión eficiente de proyectos, recursos y seguridad.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: '',
            duration: 4000,
            style: {
              background: '#22c55e',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '16px',
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid #22c55e',
            },

            // Default options for specific types
            success: {
              duration: 4000,
              icon: '✓',
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff',
              },
              style: {
                background: '#22c55e',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '16px',
                borderRadius: '8px',
                border: '2px solid #22c55e',
              },
            },
            error: {
              duration: 4000,
              icon: '✗',
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
              style: {
                background: '#ef4444',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '16px',
                borderRadius: '8px',
                border: '2px solid #ef4444',
              },
            },
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
