'use client';

import { useState, useEffect, useRef } from 'react';
import { Icons } from '@/components/Icons';
import { EstablishmentMenu, CreateMenuRequest, MENU_CONSTRAINTS } from '@/types/menu.types';

interface MenuManagerProps {
  establishmentId: string;
  isPremium: boolean;
}

export default function MenuManager({ establishmentId, isPremium }: MenuManagerProps) {
  const [menus, setMenus] = useState<EstablishmentMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadData, setUploadData] = useState<CreateMenuRequest>({
    name: '',
    description: '',
    file: null as any
  });

  // Charger les menus existants
  useEffect(() => {
    loadMenus();
  }, [establishmentId]);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/establishments/${establishmentId}/menus`);
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

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validation du fichier
    if (file.size > MENU_CONSTRAINTS.MAX_FILE_SIZE) {
      setError(`Fichier trop volumineux. Maximum ${MENU_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    if (!MENU_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.type)) {
      setError('Format de fichier non supporté. Seuls les PDF sont acceptés.');
      return;
    }

    setUploadData(prev => ({
      ...prev,
      file: file,
      name: prev.name || file.name.replace('.pdf', '')
    }));
    setError(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.name.trim()) {
      setError('Nom et fichier requis');
      return;
    }

    if (menus.length >= MENU_CONSTRAINTS.MAX_FILES) {
      setError(`Limite de ${MENU_CONSTRAINTS.MAX_FILES} menus atteinte`);
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('name', uploadData.name.trim());
      if (uploadData.description) {
        formData.append('description', uploadData.description.trim());
      }

      const response = await fetch(`/api/establishments/${establishmentId}/menus/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setMenus(prev => [...prev, data.menu]);
        setUploadData({ name: '', description: '', file: null as any });
        setShowUploadForm(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(data.error || 'Erreur lors de l\'upload');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (menuId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) return;

    try {
      const response = await fetch(`/api/establishments/${establishmentId}/menus/${menuId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setMenus(prev => prev.filter(menu => menu.id !== menuId));
      } else {
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isPremium) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Icons.Info />
        <h3 className="text-lg font-semibold text-yellow-800 mt-2">
          Fonctionnalité Premium
        </h3>
        <p className="text-yellow-700 mt-1">
          L'upload de menus PDF est réservé aux comptes Premium.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestion des menus</h2>
          <p className="text-gray-600 text-sm">
            Gérez vos menus PDF (maximum {MENU_CONSTRAINTS.MAX_FILES})
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          disabled={menus.length >= MENU_CONSTRAINTS.MAX_FILES}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Icons.Upload />
          Ajouter un menu
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Formulaire d'upload */}
      {showUploadForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un menu</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du menu *
              </label>
              <input
                type="text"
                value={uploadData.name}
                onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Menu du jour, Carte des vins..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnelle)
              </label>
              <textarea
                value={uploadData.description}
                onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Description du menu..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier PDF *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadData.file ? (
                  <div className="text-green-600">
                    <Icons.Check />
                    <p className="mt-2 font-medium">{uploadData.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(uploadData.file.size)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Icons.Upload />
                    <p className="mt-2 text-gray-600">
                      Glissez-déposez votre PDF ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-sm text-gray-500">
                      Maximum {MENU_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  Sélectionner un fichier
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadData.file || !uploadData.name.trim()}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading && <Icons.Spinner />}
                {uploading ? 'Upload en cours...' : 'Uploader le menu'}
              </button>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadData({ name: '', description: '', file: null as any });
                  setError(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des menus */}
      {loading ? (
        <div className="text-center py-8">
          <Icons.Spinner />
          <p className="mt-2 text-gray-600">Chargement des menus...</p>
        </div>
      ) : menus.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Icons.Upload />
          <p className="mt-2 text-gray-600">Aucun menu uploadé</p>
          <p className="text-sm text-gray-500">
            Ajoutez votre premier menu PDF pour commencer
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {menus.map((menu) => (
            <div key={menu.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{menu.name}</h4>
                  {menu.description && (
                    <p className="text-sm text-gray-600 mt-1">{menu.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{menu.fileName}</span>
                    <span>{formatFileSize(menu.fileSize)}</span>
                    <span className="flex items-center gap-1">
                      <Icons.Check />
                      Actif
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(menu.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Supprimer le menu"
                >
                  <Icons.X />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
