import { create } from 'zustand';

export const useStore = create((set) => ({
  messages: [],
  isLoading: false,
  addMessage: (role, text) =>
    set((state) => ({
      messages: [...state.messages, { role, text }],
    })),
  updateLastMessage: (chunk) =>
    set((state) => {
      const newMessages = [...state.messages];
      newMessages[newMessages.length - 1].text += chunk;
      return { messages: newMessages };
    }),
  setLoading: (loading) => set({ isLoading: loading }),
}));