import Head from 'next/head';
import Header from '../components/Header';
import RegistroForm from '../components/RegistroForm';

export default function Home() {
  const goToDashboard = () => {
    window.location.href = 'https://applottobueno.com/dashboard';
  };

  return (
    <>
      <Head>
        <title>Banempre - Banco de los Emprendedores</title>
        <meta name="description" content="Banempre - Banco de los Emprendedores, registra tu emprendimiento" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-banempre">
        <Header />
        <div className="container mx-auto px-4 flex min-h-[calc(100vh-100px)] items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="text-white flex flex-col items-center">
              <h1 className="text-4xl font-bold mb-4">BANEMPRE</h1>
              <h2 className="text-2xl mb-8">BANCO DE LOS EMPRENDEDORES</h2>
              <button 
                onClick={goToDashboard}
                className="bg-secondary text-white font-bold py-3 px-8 rounded-full hover:bg-yellow-600 transition-colors mt-4"
              >
                Ir al Dashboard
              </button>
            </div>
            <div>
              <RegistroForm />
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 