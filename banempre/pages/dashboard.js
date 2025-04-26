import Head from 'next/head';
import Header from '../components/Header';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard - Banempre</title>
        <meta name="description" content="Panel de control de Banempre" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-primary mb-8">Panel de Control</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-lg text-center">
              El panel de control está en construcción. Pronto podrás gestionar tu emprendimiento desde aquí.
            </p>
          </div>
        </div>
      </main>
    </>
  );
} 