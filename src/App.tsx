import React, { useState, useEffect } from 'react';
import { Users, Clock, Trophy, Plus, Trash2, Eye } from 'lucide-react';

// Voeg TypeScript interfaces toe
interface Speler {
  id: number;
  naam: string;
}

interface Wissel {
  id: number;
  positie: string;
  wisselSpelerId: string;
}

interface Kwart {
  nummer: number;
  opstelling: { [key: string]: string };
  wissels: Wissel[];
  minuten: number;
}

interface Wedstrijd {
  id: number;
  datum: string;
  tegenstander: string;
  formatie: '6x6' | '8x8';
  kwarten: Kwart[];
}

const App: React.FC = () => {
  // ... rest van de code exact hetzelfde
