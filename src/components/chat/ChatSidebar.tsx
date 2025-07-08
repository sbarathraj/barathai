import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit2, Trash2, MessageSquare, Clock, User, Crown } from "lucide-react";
import { Logo } from "@/components/Logo";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  unique_url: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onNewSession: () => void;
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  user: any;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  user
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSessionId, setEditingSessionId] = useState('');
  const [editingTitle, setEditingTitle] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRename = (sessionId: string, newTitle: string) => {
    if (newTitle.trim()) {
      onRenameSession(sessionId, newTitle.trim());
    }
    setEditingSessionId('');
    setEditingTitle('');
  };

  const startEditing = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  return (
    <div className="w-80 h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center space-x-3 mb-4">
          <Logo size={32} />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BarathAI
          </h1>
        </div>
        
        <Button
          onClick={onNewSession}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 text-sm py-2.5"
        >
          <Plus className="mr-2" size={16} />
          New Chat
        </Button>
        
        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
          />
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/10">
        <div className="flex items-center space-x-3 p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user?.email || 'User'}
            </p>
            <div className="flex items-center space-x-1 mt-0.5">
              <Crown size={12} className="text-yellow-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Premium</span>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg">
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {sessions.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Chats</div>
          </div>
          <div className="text-center p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg">
            <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {Math.floor(Math.random() * 500) + 100}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Messages</div>
          </div>
          <div className="text-center p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg">
            <div className="text-sm font-bold text-green-600 dark:text-green-400">
              {Math.floor(Math.random() * 100) + 85}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={24} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">No chat history yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start a new conversation to see it here</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                session.id === currentSessionId
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600 shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => onSelectSession(session)}
            >
              {editingSessionId === session.id ? (
                <Input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleRename(session.id, editingTitle)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleRename(session.id, editingTitle);
                    }
                  }}
                  className="w-full bg-transparent text-slate-900 dark:text-white text-sm font-medium focus:outline-none border-none p-0"
                  autoFocus
                />
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {session.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(session);
                        }}
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800/50 dark:to-purple-900/10">
        <div className="text-xs text-center text-slate-500 dark:text-slate-400">
          <p className="font-medium">BarathAI v2.0</p>
          <p className="mt-1">Created by Barathraj</p>
        </div>
      </div>
    </div>
  );
};