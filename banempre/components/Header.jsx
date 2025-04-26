import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-transparent py-4 px-6">
      <div className="flex items-center">
        <a href="https://applottobueno.com/dashboard" className="flex items-center">
          <Image
            src="/logo bamempre.png"
            alt="Banempre - Banco de los Emprendedores"
            width={200}
            height={70}
            priority
          />
        </a>
      </div>
    </header>
  );
} 