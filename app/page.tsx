"use client";

import Image from "next/image";
import SearchInput from "./components/SearchInput";
import { useEffect, useState, useRef, useCallback } from "react";
import PokemonDetails from "./components/PokemonDetails";
import Battle from "./components/Battle";
import { motion, AnimatePresence } from "framer-motion";
import 'animate.css';


import PokeBall from "./components/Pokeball";

// Types for Pokemon and Deck
interface Pokemon {
  id: number;
  identifier: string;
  name?: string;
}

interface Deck {
  id: string;
  name: string;
  pokemon: Pokemon[];
}

// Toast notification component
function Toast({ message, isVisible, onClose, type = "error" }: { message: string; isVisible: boolean; onClose: () => void; type?: "error" | "success" }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -50, x: "-50%" }}
          className={`fixed top-4 left-1/2 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Deck Panel Component
function DeckPanel({ 
  decks,
  currentDeckId,
  onSelectDeck,
  onRemove, 
  onCreateDeck,
  onDeleteDeck,
  onRenameDeck,
  isCollapsed, 
  onToggle,
  onStartBattle,
  currentDeck
}: { 
  decks: Deck[];
  currentDeckId: string;
  onSelectDeck: (id: string) => void;
  onRemove: (pokemon: Pokemon) => void;
  onCreateDeck: () => void;
  onDeleteDeck: (id: string) => void;
  onRenameDeck: (id: string, newName: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  onStartBattle: () => void;
  currentDeck: Deck;
}) {
  const MAX_DECK_SIZE = 12;
  const progress = (currentDeck.pokemon.length / MAX_DECK_SIZE) * 100;
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newDeckName, setNewDeckName] = useState("");

  const handleRename = (id: string) => {
    if (newDeckName.trim()) {
      onRenameDeck(id, newDeckName.trim());
      setIsRenaming(null);
      setNewDeckName("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className={`fixed right-4 top-4 z-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}
    >
      {/* Header */}
      <div 
        className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 cursor-pointer flex flex-col items-center gap-1"
        onClick={onToggle}
      >
        <div className="flex items-center justify-center w-full">
          <span className="text-2xl">🃏</span>
        </div>
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full px-1">
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="font-bold text-white text-sm"
            >
              My Decks
            </motion.span>
            <span className="text-white text-sm">
              {currentDeck.pokemon.length}/{MAX_DECK_SIZE}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-white text-xs font-bold">
              {currentDeck.pokemon.length}/{MAX_DECK_SIZE}
            </span>
            <span className="text-white text-xs opacity-70">◀</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {!isCollapsed && (
        <div className="px-4 pt-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${
                currentDeck.pokemon.length === MAX_DECK_SIZE 
                  ? 'bg-red-500' 
                  : currentDeck.pokemon.length >= 8 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Deck Tabs / Selector */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4"
          >
            {/* Deck Selector */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {decks.map((deck) => (
                <motion.button
                  key={deck.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectDeck(deck.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    currentDeckId === deck.id
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {deck.name}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreateDeck}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500 text-white whitespace-nowrap"
              >
                + New Deck
              </motion.button>
            </div>

            {/* Deck Actions */}
            <div className="flex gap-2 mb-3">
              {isRenaming === currentDeckId ? (
                <div className="flex-1 flex gap-1">
                  <input
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(currentDeckId)}
                    placeholder="Deck name"
                    className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRename(currentDeckId)}
                    className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => { setIsRenaming(null); setNewDeckName(""); }}
                    className="px-2 py-1 bg-gray-400 text-white rounded text-sm"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => { setIsRenaming(currentDeckId); setNewDeckName(currentDeck.name); }}
                    className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Rename
                  </button>
                  {decks.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${currentDeck.name}" deck?`)) {
                          onDeleteDeck(currentDeckId);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Current Deck Name */}
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2 truncate">
              {currentDeck.name}
            </h3>

            {/* Battle Button */}
            {currentDeck.pokemon.length >= 2 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartBattle}
                className="w-full mb-3 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm"
              >
                ⚔️ Start Battle
              </motion.button>
            )}

            {/* Deck Content */}
            {currentDeck.pokemon.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <span className="text-4xl block mb-2">📭</span>
                <p className="text-sm">This deck is empty</p>
                <p className="text-xs mt-1">Add Pokemon from the list</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentDeck.pokemon.map((p: Pokemon, index: number) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group"
                  >
                    <div className="w-10 h-10 relative flex-shrink-0">
                      <Image
                        src={`/sprites/sprites/pokemon/${p.id}.png`}
                        alt={p.identifier}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="flex-1 capitalize text-sm font-medium text-gray-800 dark:text-white truncate">
                      {p.identifier}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(p);
                      }}
                      className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      title="Remove from deck"
                    >
                      <span className="text-sm font-bold">−</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Home() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [query, setQuery] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Multi-deck state with localStorage persistence
  const [decks, setDecks] = useState<Deck[]>([]);
  const [currentDeckId, setCurrentDeckId] = useState<string>("");
  const [deckCollapsed, setDeckCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"error" | "success">("error");
  
  // Battle state
  const [battleMode, setBattleMode] = useState(false);
  const [battlePlayer1, setBattlePlayer1] = useState<number | null>(null);
  const [battlePlayer2, setBattlePlayer2] = useState<number | null>(null);
  const [battleWinner, setBattleWinner] = useState<number | null>(null);
  const [battleSelectMode, setBattleSelectMode] = useState<'player1' | 'player2' | null>(null);

  const limit = 20;
  const MAX_DECK_SIZE = 12;

  // Get current deck
  const currentDeck = decks.find(d => d.id === currentDeckId) ?? { id: '', name: '', pokemon: [] };

  // Load decks from localStorage on mount
  useEffect(() => {
    const savedDecks = localStorage.getItem('pokemon-decks');
    const savedCollapsed = localStorage.getItem('pokemon-deck-collapsed');
    
    if (savedCollapsed) {
      setDeckCollapsed(savedCollapsed === 'true');
    }
    
    if (savedDecks) {
      try {
        const parsed = JSON.parse(savedDecks);
        if (parsed.decks && parsed.decks.length > 0) {
          setDecks(parsed.decks);
          setCurrentDeckId(parsed.currentDeckId || parsed.decks[0].id);
        } else {
          // Create default deck if none exist
          const defaultDeck: Deck = {
            id: generateId(),
            name: 'My Deck',
            pokemon: []
          };
          setDecks([defaultDeck]);
          setCurrentDeckId(defaultDeck.id);
        }
      } catch (e) {
        console.error('Failed to parse decks from localStorage:', e);
        createNewDeck();
      }
    } else {
      createNewDeck();
    }
  }, []);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Create new deck
  const createNewDeck = useCallback(() => {
    const newDeck: Deck = {
      id: generateId(),
      name: `Deck ${decks.length + 1}`,
      pokemon: []
    };
    setDecks(prev => [...prev, newDeck]);
    setCurrentDeckId(newDeck.id);
    setToastMessage(`Created "${newDeck.name}"!`);
    setToastType("success");
    setShowToast(true);
  }, [decks.length]);

  // Delete deck
  const deleteDeck = useCallback((deckId: string) => {
    if (decks.length <= 1) {
      setToastMessage("Cannot delete the last deck!");
      setToastType("error");
      setShowToast(true);
      return;
    }
    
    const deckToDelete = decks.find(d => d.id === deckId);
    const newDecks = decks.filter(d => d.id !== deckId);
    setDecks(newDecks);
    
    if (currentDeckId === deckId) {
      setCurrentDeckId(newDecks[0].id);
    }
    
    setToastMessage(`Deleted "${deckToDelete?.name}"!`);
    setToastType("success");
    setShowToast(true);
  }, [decks, currentDeckId]);

  // Rename deck
  const renameDeck = useCallback((deckId: string, newName: string) => {
    setDecks(prev => prev.map(d => 
      d.id === deckId ? { ...d, name: newName } : d
    ));
    setToastMessage(`Renamed to "${newName}"!`);
    setToastType("success");
    setShowToast(true);
  }, []);

  // Switch deck
  const switchDeck = useCallback((deckId: string) => {
    setCurrentDeckId(deckId);
  }, []);

  // Save decks to localStorage when they change
  useEffect(() => {
    if (decks.length > 0) {
      localStorage.setItem('pokemon-decks', JSON.stringify({ 
        decks, 
        currentDeckId 
      }));
    }
  }, [decks, currentDeckId]);

  // Save collapse state to localStorage
  useEffect(() => {
    localStorage.setItem('pokemon-deck-collapsed', String(deckCollapsed));
  }, [deckCollapsed]);

  // Check if Pokemon is in current deck
  const isInDeck = useCallback((pokemonId: number): boolean => {
    return currentDeck.pokemon.some(p => p.id === pokemonId);
  }, [currentDeck.pokemon]);

  // Add Pokemon to current deck
  const addToDeck = useCallback((p: Pokemon) => {
    if (currentDeck.pokemon.length >= MAX_DECK_SIZE) {
      setToastMessage(`Deck is full! Maximum ${MAX_DECK_SIZE} Pokemon allowed.`);
      setToastType("error");
      setShowToast(true);
      return;
    }

    if (isInDeck(p.id)) {
      setToastMessage(`${p.identifier} is already in this deck!`);
      setToastType("error");
      setShowToast(true);
      return;
    }

    setDecks(prev => prev.map(d => 
      d.id === currentDeckId 
        ? { ...d, pokemon: [...d.pokemon, p] } 
        : d
    ));
    setToastMessage(`Added ${p.identifier} to deck!`);
    setToastType("success");
    setShowToast(true);
  }, [currentDeck.pokemon.length, isInDeck, currentDeckId]);

  // Remove Pokemon from current deck
  const removeFromDeck = useCallback((p: Pokemon) => {
    setDecks(prev => prev.map(d => 
      d.id === currentDeckId 
        ? { ...d, pokemon: d.pokemon.filter(pokemon => pokemon.id !== p.id) } 
        : d
    ));
    setToastMessage(`Removed ${p.identifier} from deck!`);
    setToastType("success");
    setShowToast(true);
  }, [currentDeckId]);

  const loadPokemon = async (skipValue: number, append: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pokemon?q=${encodeURIComponent(query)}&skip=${skipValue}&limit=${limit}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      if (append) {
        setPokemon(prev => [...prev, ...data]);
      } else {
        setPokemon(data);
      }
      
      setHasMore(data.length === limit);
    } catch (error) {
      console.error("Failed to load Pokemon:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSkip(0);
    loadPokemon(0, false);
  }, [query]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (query !== "") return; // Disable infinite scroll during search
    if (!hasMore || loading) return;

    const container = document.getElementById('pokemon-list-container');
    const sentinel = document.getElementById('scroll-sentinel');
    
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && query === "") {
          const newSkip = skip + limit;
          setSkip(newSkip);
          loadPokemon(newSkip, true);
        }
      },
      { root: container, rootMargin: '0px', threshold: 0.9 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, skip, query, limit]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black"
    >
      {/* Toast Notification */}
      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)}
        type={toastType}
      />

      {/* Left Side - Pokemon List */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, x: -50 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        id="pokemon-list-container" 
        className="w-1/2 min-h-screen p-6 overflow-y-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Pokemon List</h1>
          <SearchInput onSearch={setQuery} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {pokemon.map((p: Pokemon, index: number) => {
            const inDeck = isInDeck(p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.03, ease: "easeOut" }}
                className={`border p-4 rounded-lg hover:shadow-lg transition-all cursor-pointer relative overflow-hidden ${
                  selectedPokemon?.id === p.id 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-amber-300 bg-white dark:bg-gray-800 dark:border-gray-700'
                } ${inDeck ? 'ring-2 ring-green-500' : ''}`}
                style={{
                  backgroundImage: `url(/sprites/sprites/pokemon/${p.id}.png)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: 1
                }}
                onClick={() => setSelectedPokemon(p)}
              >
                <div className="relative z-10 bg-white/80 dark:bg-gray-900/80 rounded-lg p-2">
                  <h2 className="font-bold capitalize text-lg text-gray-800 dark:text-white">{p.identifier}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID: {p.id}</p>
                  
                  {/* Add to Deck / Remove Button */}
                  {inDeck ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromDeck(p);
                      }}
                      className="mt-2 w-full py-1.5 px-3 rounded-lg text-sm font-medium transition-colors bg-red-500 hover:bg-red-600 text-white"
                    >
                      − Remove from Deck
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToDeck(p);
                      }}
                      disabled={inDeck}
                      className={`mt-2 w-full py-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                        inDeck
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {inDeck ? '✓ In Deck' : '+ Add to Deck'}
                    </motion.button>
                  )}
                </div>
                
                {/* In Deck Badge */}
                {inDeck && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
                  >
                    In Deck
                  </motion.div>
                )}
              </motion.div>
            );
          })}
          
          {/* Loading indicator and infinite scroll trigger */}
          <div className="col-span-2 flex justify-center py-4">
            {loading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
              >
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading more Pokemon...</span>
              </motion.div>
            )}
            {!hasMore && pokemon.length > 0 && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-gray-500 text-sm"
              >
                No more Pokemon to load
              </motion.p>
            )}
          </div>
          
          {/* Sentinel element for Intersection Observer */}
          <div id="scroll-sentinel" className="h-4" />
        </div>
      </motion.div>

      {/* Right Side - Pokemon Details */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, x: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="w-1/2 min-h-screen p-6 bg-gray-100 dark:bg-gray-900 overflow-y-auto"
      >
        {selectedPokemon ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <PokemonDetails pokemon={selectedPokemon} />
            
            {/* Add to Deck Button in Details Panel */}
            <div className="mt-4">
              {isInDeck(selectedPokemon.id) ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => removeFromDeck(selectedPokemon)}
                  className="w-full py-3 px-6 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Remove from Deck
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToDeck(selectedPokemon)}
                  disabled={currentDeck.pokemon.length >= MAX_DECK_SIZE}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    currentDeck.pokemon.length >= MAX_DECK_SIZE
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {currentDeck.pokemon.length >= MAX_DECK_SIZE ? 'Deck Full' : 'Add to Deck'}
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center justify-center h-full"
          >
            <p className="text-gray-500 text-xl">Select a Pokemon to see details</p>
          </motion.div>
        )}
      </motion.div>

      {/* Deck Panel */}
      <DeckPanel
        decks={decks}
        currentDeckId={currentDeckId}
        onSelectDeck={switchDeck}
        onRemove={removeFromDeck}
        onCreateDeck={createNewDeck}
        onDeleteDeck={deleteDeck}
        onRenameDeck={renameDeck}
        isCollapsed={deckCollapsed}
        onToggle={() => setDeckCollapsed(!deckCollapsed)}
        onStartBattle={() => {
          if (currentDeck.pokemon.length >= 2) {
            // Pick first two Pokemon for battle
            setBattlePlayer1(currentDeck.pokemon[0].id);
            setBattlePlayer2(currentDeck.pokemon[1].id);
            setBattleMode(true);
          }
        }}
        currentDeck={currentDeck}
      />

      {/* Battle Mode */}
      {battleMode && battlePlayer1 && battlePlayer2 && (
        <Battle
          player1PokemonId={battlePlayer1}
          player2PokemonId={battlePlayer2}
          onBattleEnd={(winner) => {
            setBattleWinner(winner);
          }}
          onExit={() => {
            setBattleMode(false);
            setBattlePlayer1(null);
            setBattlePlayer2(null);
            setBattleWinner(null);
          }}
        />
      )}
    </motion.div>
  );
}
