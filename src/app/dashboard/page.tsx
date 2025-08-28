'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query } from 'firebase/firestore';

import { db } from '../../lib/firebase';
import Modal from '../../components/Modal';

// Tipos
interface Candidate {
  id: string;
  name: string;
  email: string;
  fitScore: number;
  classification: string;
}

interface ModalContent {
  title: string;
  message: string;
  isSuccess: boolean;
}

// Função para estilizar a classificação
const getClassificationStyle = (score: number) => {
  if (score >= 80) return { label: 'Fit Altíssimo', color: 'bg-green-500' };
  if (score >= 60) return { label: 'Fit Aprovado', color: 'bg-blue-500' };
  if (score >= 40) return { label: 'Fit Questionável', color: 'bg-yellow-500' };
  return { label: 'Fora do Perfil', color: 'bg-red-500' };
};

// Componente da página do Dashboard
export default function DashboardPage() {
  // Estados da UI e dados
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do Modal e simulação
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Efeito para buscar os dados do Firestore em tempo real
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_APP_ID || 'default-app-id';
    const candidatesCollection = collection(db, `artifacts/${appId}/public/data/candidates`);
    const q = query(candidatesCollection);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const candidateList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Candidate));
      setCandidates(candidateList);
      setLoading(false);
    }, (err) => {
      console.error("Erro ao buscar dados do Firestore:", err);
      setError("Não foi possível carregar os dados. Verifique a configuração do Firebase e sua conexão.");
      setLoading(false);
    });

    // Limpeza da subscrição ao desmontar o componente
    return () => unsubscribe();
  }, []);

  // Simulação da geração de relatório
  const simulateReport = async () => {
    setIsGeneratingReport(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula atraso
    setIsGeneratingReport(false);
    setModalContent({
      title: 'Relatório Gerado!',
      message: 'A lógica 2 (Relatório de Aprovados) foi acionada. O gestor da LEGAL foi notificado com a lista de candidatos com FitScore >= 80.',
      isSuccess: true
    });
    setShowModal(true);
    console.log("Lógica 2 (Relatório de Aprovados) foi acionada.");
  };

  // Filtra os candidatos com base no filtro selecionado
  const filteredCandidates = candidates.filter(c => filter === 'all' || c.classification === filter);
  const uniqueClassifications = Array.from(new Set(candidates.map(c => c.classification)));

  return (
    <div className="bg-gray-50 min-h-screen font-sans antialiased text-gray-800">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-blue-600">Dashboard FitScore™</h1>
          <p className="mt-2 text-gray-600">Listagem de todos os candidatos avaliados.</p>
        </header>

        <main className="bg-white rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
          {error ? (
            <div className="p-6 text-center text-red-500 font-semibold rounded-2xl bg-red-100">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">Filtrar por:</span>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="all">Todas as Classificações</option>
                    {uniqueClassifications.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button
                  onClick={simulateReport}
                  disabled={isGeneratingReport || loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingReport ? 'Gerando Relatório...' : 'Gerar Relatório de Aprovados'}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-20 text-gray-500">
                  <p>Carregando candidatos...</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <p>Nenhum candidato encontrado. {filter !== 'all' && 'Tente alterar o filtro.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl shadow-md">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">E-mail</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">FitScore</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Classificação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCandidates.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">{c.fitScore}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getClassificationStyle(c.fitScore).color}`}>
                              {c.classification}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          
          <div className="text-center pt-4">
            <Link href="/" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
              Avaliar Novo Candidato
            </Link>
          </div>
        </main>
      </div>

      {showModal && modalContent && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="text-center p-4">
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${modalContent.isSuccess ? 'bg-green-100' : 'bg-red-100'} mb-4`}>
               <svg className={`h-6 w-6 ${modalContent.isSuccess ? 'text-green-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {modalContent.isSuccess ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{modalContent.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{modalContent.message}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
