import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import RegistroForm from '../components/RegistroForm';

export default function Home() {
  const router = useRouter();
  
  const goToDashboard = () => {
    router.push('/dashboard');
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
        <div className="container mx-auto px-4 py-4 md:py-6 flex flex-col min-h-screen">
          {/* Logo en la esquina superior izquierda */}
          <div className="flex justify-start mb-4 md:mb-10">
            <a href="#" onClick={(e) => { e.preventDefault(); goToDashboard(); }}>
              <Image
                src="/logo bamempre.png"
                alt="Banempre - Banco de los Emprendedores"
                width={330}
                height={70}
                className="w-64 md:w-72"
                priority
              />
            </a>
          </div>

          {/* Contenido principal - formulario a la derecha en desktop, centrado en móvil */}
          <div className="flex-grow flex flex-col md:flex-row md:justify-end items-center md:items-start">
            {/* Formulario */}
            <div className="w-full md:w-1/2 lg:w-5/12">
              <RegistroForm />
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 