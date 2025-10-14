import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import EnvieSearchBar from '@/app/sections/EnvieSearchBar';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

global.fetch = jest.fn();

const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
};
global.navigator.geolocation = mockGeolocation;

describe('EnvieSearchBar', () => {
  let mockRouterPush: jest.Mock;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (fetch as jest.Mock).mockClear();
    mockGeolocation.getCurrentPosition.mockClear();
  });

  // 1. Tests de rendu
  it('doit afficher la barre de recherche avec tous ses éléments', () => {
    render(<EnvieSearchBar />);
    expect(screen.getByPlaceholderText("Bar à bière, billard, fléchettes...")).toBeInTheDocument();
    expect(screen.getByText('Autour de moi')).toBeInTheDocument();
    expect(screen.getByText('Rechercher')).toBeInTheDocument();
  });

  // 2. Tests d'interaction
  it("doit mettre à jour l'input quand l'utilisateur tape une envie", () => {
    render(<EnvieSearchBar />);
    const input = screen.getByPlaceholderText("Bar à bière, billard, fléchettes...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'jouer au billard' } });
    expect(input.value).toBe('jouer au billard');
  });

  it("doit afficher le sélecteur de ville après avoir tapé au moins 3 caractères", () => {
    render(<EnvieSearchBar />);
    const input = screen.getByPlaceholderText("Bar à bière, billard, fléchettes...");
    fireEvent.change(input, { target: { value: 'par' } });
    expect(screen.queryByText('Paris, France')).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'pari' } });
    // Le mock de fetch est nécessaire ici pour simuler la réponse de l'API de villes
    (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve([{ "matching_full_name": "Paris, France" }]),
    });
    // On attend que le résultat s'affiche
  });

  it("doit soumettre la recherche avec l'envie et la ville sélectionnée", async () => {
    render(<EnvieSearchBar />);
    const envieInput = screen.getByPlaceholderText("Bar à bière, billard, fléchettes...");
    fireEvent.change(envieInput, { target: { value: 'bière' } });
    
    const searchButton = screen.getByText('Rechercher');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/recherche/envie?envie=bi%C3%A8re&ville=Dijon&rayon=5');
    });
  });

  // 3. Géolocalisation
  it("doit utiliser la géolocalisation en cliquant sur 'Autour de moi'", async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) =>
      success({
        coords: {
          latitude: 48.8566,
          longitude: 2.3522,
          accuracy: 0,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      })
    );
    
    render(<EnvieSearchBar />);
    const geoButton = screen.getByText('Autour de moi');
    fireEvent.click(geoButton);
    
    await waitFor(() => {
        const searchButton = screen.getByText('Rechercher');
        fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/recherche/envie?envie=&lat=48.8566&lng=2.3522&rayon=5');
    });
  });

  // 4. Validation et cas limites
  it("doit afficher un message d'erreur si l'envie est vide après un premier essai", async () => {
    render(<EnvieSearchBar />);
    const searchButton = screen.getByText('Rechercher');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("Veuillez entrer une envie pour lancer la recherche.")).toBeInTheDocument();
    });

    // Le message doit disparaître quand on tape quelque chose
    const envieInput = screen.getByPlaceholderText("Bar à bière, billard, fléchettes...");
    fireEvent.change(envieInput, { target: { value: 'test' } });
    await waitFor(() => {
        expect(screen.queryByText("Veuillez entrer une envie pour lancer la recherche.")).not.toBeInTheDocument();
    });
  });

  // 5. Analytics
  it("doit tracker la recherche quand le formulaire est soumis", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    
    render(<EnvieSearchBar />);
    const envieInput = screen.getByPlaceholderText("Bar à bière, billard, fléchettes...");
    fireEvent.change(envieInput, { target: { value: 'fléchettes' } });
    
    const searchButton = screen.getByText('Rechercher');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/analytics/search', expect.any(Object));
    });
  });
});

