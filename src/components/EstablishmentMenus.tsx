'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/Icons';
import { PublicMenuDisplay } from '@/types/menu.types';

interface EstablishmentMenusProps {
  establishmentSlug: string;
}

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: PublicMenuDisplay | null;
}

function PDFModal({ isOpen, onClose, menu }: PDFModalProps) {
  if (!isOpen || !menu) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{menu.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <Icons.X />
          </button>
        </div>
        
        <div className="flex-1 p-4">
          <iframe
            src={`${menu.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full min-h-[500px] border-0 rounded"
            title={menu.name}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {menu.fileName} • {formatFileSize(menu.fileSize)}
          </div>
          <a
            href={menu.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
          >
            <Icons.Upload />
            Télécharger
          </a>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function EstablishmentMenus({ establishmentSlug }: EstablishmentMenusProps) {
  const [menus, setMenus] = useState<PublicMenuDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<PublicMenuDisplay | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadMenus();
  }, [establishmentSlug]);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/establishments/${establishmentSlug}/menus`);
      const data = await response.json();
      
      if (data.success) {
        setMenus(data.menus);
      } else {
        setError(data.error || 'Erreur lors du chargement des menus');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (menu: PublicMenuDisplay) => {
    setSelectedMenu(menu);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMenu(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Icons.Spinner />
          <span className="ml-2 text-gray-600">Chargement des menus...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="text-center py-8">
          <Icons.X />
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="text-center py-8">
          <Icons.Upload />
          <h3 className="text-lg font-semibold text-gray-900 mt-2">Nos menus</h3>
          <p className="text-gray-600 mt-1">Aucun menu dans cet établissement</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icons.Upload />
          Nos menus
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <div
              key={menu.id}
              onClick={() => handleMenuClick(menu)}
              className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md cursor-pointer transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{menu.name}</h4>
                  {menu.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{menu.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>PDF</span>
                    <span>•</span>
                    <span>{formatFileSize(menu.fileSize)}</span>
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PDFModal
        isOpen={showModal}
        onClose={handleCloseModal}
        menu={selectedMenu}
      />
    </>
  );
}
