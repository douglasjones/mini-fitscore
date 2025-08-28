'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

import { db, auth } from '../lib/firebase';
import Modal from '../components/Modal';

// Tipos para o conteúdo do modal
interface ModalContent {
  title: string;
  message: string;
  isSuccess: boolean;
}

// Tipos para as props do componente de input
interface QuestionInputProps {
  label: string;
  index: number;
  value: number;
  onChange: (index: number, value: number) => void;
}

// Componente de input para cada pergunta
const QuestionInput = ({ label, index, value, onChange }: QuestionInputProps) => (
  <div className="flex flex-col mb-4">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type="range"
      min="0"
      max="10"
      value={value}
      onChange={(e) => onChange(index, parseInt(e.target.value))}
      className="mt-1 w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
    <div className="flex justify-between text-xs text-gray-500 mt-1">
      <span>0</span>
      <span>{value}</span>
      <span>10</span>
    </div>
  </div>
);

// Componente da página principal (Formulário)
export default function FormPage() {
  const router = useRouter();

  // Estados do formulário e da UI
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [scores, setScores] = useState(Array(10).fill(5));
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados do Modal e simulação
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autenticação anônima com Firebase
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
      } else {
        signInAnonymously(auth).catch((authError) => {
          console.error("Erro de autenticação anônima:", authError);
          setError("Falha na autenticação. Não será possível salvar os dados.");
        });
      }
    });
  }, []);

  // Função para calcular a classificação
  const getClassification = (score: number) => {
    if (score >= 80) return 'Fit Altíssimo';
    if (score >= 60) return 'Fit Aprovado';
    if (score >= 40) return 'Fit Questionável';
    return 'Fora do Perfil';
  };

  // Simulação da notificação assíncrona
  const simulateNotification = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula atraso de rede
    console.log("Lógica 1 (Notificação de Resultado) foi acionada.");
  };

  // Handler para mudança nos scores
  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  // Handler para submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthReady) {
      setError("A autenticação ainda não está pronta. Tente novamente em alguns segundos.");
      return;
    }
    setIsSubmitting(true);

    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const classification = getClassification(totalScore);
    const appId = process.env.NEXT_PUBLIC_APP_ID || 'default-app-id';

    try {
      // Salva no Firestore
      await addDoc(collection(db, `artifacts/${appId}/public/data/candidates`), {
        name,
        email,
        fitScore: totalScore,
        classification,
        userId,
        timestamp: Timestamp.now(),
      });

      // Simula notificação e mostra modal de sucesso
      await simulateNotification();
      setModalContent({
        title: 'Avaliação Enviada com Sucesso!',
        message: 'O candidato foi avaliado e a notificação simulada foi disparada.',
        isSuccess: true,
      });
      setShowModal(true);

    } catch (err: unknown) { // Explicitly type err as unknown
      console.error("Erro ao salvar os dados:", err);
      let errorMessage = "Erro desconhecido ao salvar os dados.";
      if (err instanceof Error) { // Type guard to check if err is an instance of Error
        errorMessage = `Não foi possível salvar os dados. Verifique sua conexão ou a configuração do Firebase. Detalhes: ${err.message}`;
      }
      setModalContent({
        title: 'Erro ao Enviar!',
        message: errorMessage,
        isSuccess: false,
      });
      setShowModal(true);
      setIsSubmitting(false);
    }
  };

  // Fecha o modal e redireciona se o envio foi bem-sucedido
  const handleCloseModal = () => {
    setShowModal(false);
    setIsSubmitting(false); // Reseta o estado do botão
    if (modalContent?.isSuccess) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans antialiased text-gray-800">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-blue-600">Mini FitScore™</h1>
          <p className="mt-2 text-gray-600">Avalie um candidato para gerar o FitScore.</p>
        </header>

        <main className="bg-white rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
          {error && (
            <div className="p-4 text-center text-red-500 font-semibold rounded-2xl bg-red-100">
              <p>{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Nome do Candidato"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <input
                  type="email"
                  placeholder="E-mail do Candidato"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Bloco Performance */}
              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Performance</h3>
                <QuestionInput label="Experiência" index={0} value={scores[0]} onChange={handleScoreChange} />
                <QuestionInput label="Entregas" index={1} value={scores[1]} onChange={handleScoreChange} />
                <QuestionInput label="Habilidades" index={2} value={scores[2]} onChange={handleScoreChange} />
                <QuestionInput label="Problemas" index={3} value={scores[3]} onChange={handleScoreChange} />
              </div>

              {/* Bloco Energia */}
              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Energia</h3>
                <QuestionInput label="Disponibilidade" index={4} value={scores[4]} onChange={handleScoreChange} />
                <QuestionInput label="Ritmo" index={5} value={scores[5]} onChange={handleScoreChange} />
                <QuestionInput label="Pressão" index={6} value={scores[6]} onChange={handleScoreChange} />
              </div>

              {/* Bloco Cultura */}
              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Cultura</h3>
                <QuestionInput label="Valores" index={7} value={scores[7]} onChange={handleScoreChange} />
                <QuestionInput label="Colaboração" index={8} value={scores[8]} onChange={handleScoreChange} />
                <QuestionInput label="Comunicação" index={9} value={scores[9]} onChange={handleScoreChange} />
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={!isAuthReady || isSubmitting}
                className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isSubmitting ? 'Enviando Avaliação...' : 'Avaliar Candidato'}
              </button>
            </div>
          </form>
        </main>
      </div>

      {showModal && modalContent && (
        <Modal onClose={handleCloseModal}>
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