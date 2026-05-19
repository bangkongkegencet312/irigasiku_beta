import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-2">Oops! Halaman Tidak Ditemukan</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Halaman tidak ditemukan. Alamat web yang kamu masukkan sepertinya salah ketik atau tidak terdaftar di sistem.
      </p>
      
      {/* Tombol untuk kembali ke jalan yang benar */}
      <Link 
        to="/" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}