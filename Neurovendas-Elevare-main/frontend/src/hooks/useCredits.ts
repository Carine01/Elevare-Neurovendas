/**
 * Hook para gerenciar créditos do usuário
 * Verificação, consumo e reembolso de créditos
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export interface CreditBalance {
  balance: number;
  total_available_month: number;
  total_used_month: number;
  remaining_percent: number;
  month_reset_date: string;
}

interface CreditCheckResult {
  available: boolean;
  required_credits: number;
  current_balance: number;
  error: string | null;
}

export function useCredits() {
  const { toast } = useToast();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [checking, setChecking] = useState(false);

  /**
   * Busca saldo de créditos atual
   */
  const fetchBalance = useCallback(async () => {
    setChecking(true);
    try {
      const response = await api.get('/api/credits/balance');
      setBalance(response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar saldo de créditos:", error);
      return null;
    } finally {
      setChecking(false);
    }
  }, []);

  /**
   * Verifica se usuário tem créditos suficientes para uma ação
   */
  const checkCredits = useCallback(async (action: string): Promise<CreditCheckResult | null> => {
    setChecking(true);
    try {
      const response = await api.post(`/api/credits/check/${action}`);
      const result = response.data;

      if (!result.available) {
        toast({
          title: "Créditos insuficientes",
          description: `Necessário: ${result.required_credits} créditos. Disponível: ${result.current_balance}. Seu saldo será restaurado no próximo mês.`,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      toast({
        title: "Erro ao verificar créditos",
        description: "Não foi possível verificar seu saldo. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setChecking(false);
    }
  }, [toast]);

  /**
   * Consome créditos após sucesso de geração
   */
  const consumeCredits = useCallback(async (action: string) => {
    try {
      const response = await api.post(`/api/credits/consume/${action}`);
      setBalance((prev) =>
        prev
          ? {
              ...prev,
              balance: response.data.new_balance,
              total_used_month: prev.total_used_month + response.data.credits_consumed,
              remaining_percent: (response.data.new_balance / prev.total_available_month) * 100,
            }
          : null
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 402) {
        toast({
          title: "Créditos insuficientes",
          description: "Seu saldo foi atualizado. Adquira mais créditos para continuar.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao consumir créditos",
          description: error.response?.data?.detail || "Algo deu errado. Tente novamente.",
          variant: "destructive",
        });
      }
      throw error;
    }
  }, [toast]);

  /**
   * Reembolsa créditos (ex: geração falhou)
   */
  const refundCredits = useCallback(
    async (action: string, reason: string = "Geração falhou") => {
      try {
        const response = await api.post(`/api/credits/refund/${action}`, { reason });
        setBalance((prev) =>
          prev
            ? {
                ...prev,
                balance: response.data.new_balance,
                total_used_month: prev.total_used_month - response.data.credits_refunded,
                remaining_percent: (response.data.new_balance / prev.total_available_month) * 100,
              }
            : null
        );
        return response.data;
      } catch (error) {
        console.error("Erro ao reembolsar créditos:", error);
        throw error;
      }
    },
    []
  );

  return {
    balance,
    checking,
    fetchBalance,
    checkCredits,
    consumeCredits,
    refundCredits,
  };
}
