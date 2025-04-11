import Image from 'next/image';

export default function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="Logo"
      width={100}
      height={100}
      className="h-10 object-contain"
    />
  );
}
