import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../infrastructure/supabase';
import { useAuth } from './AuthContext';

const SuggestionsContext = createContext({});

export const SuggestionsProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSuggestions();
    }
  }, [user]);

  const fetchSuggestions = async () => {
    setLoading(true);
    
    // We fetch suggestions and join with votes to get count and check if current user voted
    const { data, error } = await supabase
      .from('suggestions')
      .select(`
        *,
        suggestion_votes(user_id)
      `)
      .order('created_at', { ascending: false });

    if (!error) {
      const formatted = data.map(s => ({
        ...s,
        votesCount: s.suggestion_votes.length,
        hasVoted: s.suggestion_votes.some(v => v.user_id === user?.id),
        status: s.status || 'aberto' // Fallback for safety
      })).sort((a, b) => b.votesCount - a.votesCount || new Date(b.created_at) - new Date(a.created_at));
      
      setSuggestions(formatted);
    }
    setLoading(false);
  };

  const createSuggestion = async (title, description) => {
    if (!user) return { error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('suggestions')
      .insert([{
        user_id: user.id,
        title,
        description,
        status: 'aberto'
      }])
      .select();

    if (!error) {
      setSuggestions([
        { ...data[0], votesCount: 0, hasVoted: false, status: 'aberto' },
        ...suggestions
      ]);
    }
    return { data, error };
  };

  const updateSuggestionStatus = async (id, status) => {
    if (!isAdmin) return { error: 'Permission denied' };

    const { error } = await supabase.rpc('update_suggestion_status', {
      suggestion_id: id,
      new_status: status
    });

    if (!error) {
      setSuggestions(prev => prev.map(s => 
        s.id === id ? { ...s, status } : s
      ));
    }
    return { error };
  };

  const toggleVote = async (suggestionId) => {
    if (!user) return { error: 'Unauthorized' };

    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    if (suggestion.hasVoted) {
      // Remove vote
      const { error } = await supabase
        .from('suggestion_votes')
        .delete()
        .eq('suggestion_id', suggestionId)
        .eq('user_id', user.id);

      if (!error) {
        setSuggestions(prev => prev.map(s => 
          s.id === suggestionId 
            ? { ...s, hasVoted: false, votesCount: s.votesCount - 1 } 
            : s
        ));
      }
      return { error };
    } else {
      // Add vote
      const { error } = await supabase
        .from('suggestion_votes')
        .insert([{
          suggestion_id: suggestionId,
          user_id: user.id
        }]);

      if (!error) {
        setSuggestions(prev => prev.map(s => 
          s.id === suggestionId 
            ? { ...s, hasVoted: true, votesCount: s.votesCount + 1 } 
            : s
        ));
      }
      return { error };
    }
  };

  const deleteSuggestion = async (id) => {
    const { error } = await supabase
      .from('suggestions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Security: only owner can delete

    if (!error) {
      setSuggestions(suggestions.filter(s => s.id !== id));
    }
    return { error };
  };

  return (
    <SuggestionsContext.Provider value={{
      suggestions,
      loading,
      fetchSuggestions,
      createSuggestion,
      toggleVote,
      deleteSuggestion,
      updateSuggestionStatus,
      isAdmin,
      userId: user?.id
    }}>
      {children}
    </SuggestionsContext.Provider>
  );
};

export const useSuggestions = () => useContext(SuggestionsContext);
