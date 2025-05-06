import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-transparent py-6 px-6">
      <div className="flex items-center justify-center">
        <a href="https://applottobueno.com/dashboard" className="flex items-center">
          <Image
            src="/logo bamempre.png"
            alt="Banempre - Banco de los Emprendedores"
            width={280}
            height={100}
            priority
            className="mb-4"
          />
        </a>
      </div>
    </header>
  );
} 