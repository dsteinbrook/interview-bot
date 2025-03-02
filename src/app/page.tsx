'use client';

import { useState, useRef, useEffect } from 'react';
import { TextField, Paper, Box, Typography, Button, List, ListItemButton, ListItemText, Drawer, CircularProgress } from '@mui/material';
import { DBConversation, createConversation, getConversations, getConversationMessages } from '@/utils/db';
import AddIcon from '@mui/icons-material/Add';
import {ConversationStatus} from '../utils/interviewController';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const DRAWER_WIDTH = 300;
const CONVERSATIONS_PAGE_SIZE = 20;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<DBConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [status, setStatus] = useState<ConversationStatus>(ConversationStatus.InProgress)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationsContainerRef = useRef<HTMLDivElement>(null);

  // Load initial conversations
  useEffect(() => {

    async function onLoad(){
    const index = await loadConversations(1, true);
  
    startNewConversation(index || 0);
    
    

    }
    onLoad();
    
  }, []);



  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!conversationsContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const lastEntry = entries[entries.length - 1];
        if (lastEntry.isIntersecting && hasMoreConversations && !isLoadingMore) {
          loadMoreConversations();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(conversationsContainerRef.current);

    return () => observer.disconnect();
  }, [hasMoreConversations, isLoadingMore]);

  const loadConversations = async (page: number, reset: boolean = false) => {
    try {
      setIsLoadingMore(true);
      const result = await getConversations(page, CONVERSATIONS_PAGE_SIZE);
      setHasMoreConversations(result.hasMore);
      setConversations(prev => reset ? result.conversations : [...prev, ...result.conversations]);
      setCurrentPage(page);
      return result.conversations.length;
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadMoreConversations = () => {
    if (hasMoreConversations && !isLoadingMore) {
      loadConversations(currentPage + 1);
    }
  };

  const startNewConversation = async (index: number) => {
    try {
      const title = `Conversation ${index + 1}`;
      const newConversationId = await createConversation(title);
      setCurrentConversationId(newConversationId);
      setMessages([]);

      setIsLoading(true);

      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [],
          conversationId: newConversationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      console.log('data', data);
      setStatus(data.status);
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content,
      };
      setMessages(prev => [...prev, assistantMessage]);


      // Reload first page of conversations
      await loadConversations(1, true);
    } catch (error) {
      console.error('Error creating new conversation:', error);
    } finally {
      setIsLoading(false)
    }
  };

  const loadConversation = async (conversationId: number) => {
    try {
      const messages = await getConversationMessages(conversationId);
      setCurrentConversationId(conversationId);
      setMessages(messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
      e.preventDefault();

      if (!currentConversationId) {
        await startNewConversation(conversations.length);
      }

      const userMessage: Message = { role: 'user', content: input.trim() };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            conversationId: currentConversationId
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();
        console.log('data', data);
        setStatus(data.status);
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.content,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error:', error);
        // You might want to show an error message to the user here
      } finally {
        setIsLoading(false);
      }
    }
  };

  // const handleSubmit = async (e: React.KeyboardEvent) => {
  //   if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
  //     e.preventDefault();

  //     if (!currentConversationId) {
  //       await startNewConversation();
  //     }

  //     const userMessage: Message = { role: 'user', content: input.trim() };
  //     setMessages(prev => [...prev, userMessage]);
  //     setInput('');
  //     setIsLoading(true);

  //     try {
  //       const response = await fetch('/api/chat', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           messages: [...messages, userMessage],
  //           conversationId: currentConversationId
  //         }),
  //       });

  //       if (!response.ok) {
  //         throw new Error('Failed to get response');
  //       }

  //       const data = await response.json();
  //       const assistantMessage: Message = {
  //         role: 'assistant',
  //         content: data.content,
  //       };
  //       setMessages(prev => [...prev, assistantMessage]);
  //     } catch (error) {
  //       console.error('Error:', error);
  //       // You might want to show an error message to the user here
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  // };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {startNewConversation(conversations.length)}}
          >
            New Chat
          </Button>
        </Box>
        <List sx={{ overflow: 'auto', flex: 1, position: 'relative' }}>
          {conversations.map((conversation) => (
            <ListItemButton
              key={conversation.id}
              onClick={() => loadConversation(conversation.id)}
              selected={conversation.id === currentConversationId}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemText
                primary={conversation.title}
                secondary={new Date(conversation.updated_at).toLocaleDateString()}
              />
            </ListItemButton>
          ))}
          {isLoadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          <div ref={conversationsContainerRef} style={{ height: 20 }} />
        </List>
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: 'background.default'
          }}
        >
          <Box 
            sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {messages.map((message, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                  color: message.role === 'user' ? 'white' : 'text.primary'
                }}
              >
                <Typography>{message.content}</Typography>
              </Paper>
            ))}
            {isLoading && <Paper sx={{
              p: 2,
              maxWidth: '80%',
              alignSelf: 'flex-start',
              bgColor: 'background.paper',
              color: 'text.primary'
            }}>
              <CircularProgress />
              </Paper>}
            <div ref={messagesEndRef} />
          </Box>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleSubmit}
              placeholder="Type your message and press Enter to send..."
              disabled={isLoading || status === ConversationStatus.Completed}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
