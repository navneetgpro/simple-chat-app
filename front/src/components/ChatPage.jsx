import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';

const ChatPage = ({ socket }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(() => {
      const locmessages = localStorage.getItem('messages');
      return locmessages ? JSON.parse(locmessages) : [];
  });
  const [typingStatus, setTypingStatus] = useState('');
  const lastMessageRef = useRef(null);

  useEffect(() => {
    socket.on('messageResponse', (data) =>{
      const nm = [...messages, data];
      setMessages(nm);
      localStorage.setItem('messages', JSON.stringify(nm))
    });
  }, [socket, messages]);

  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (localStorage.getItem('userName')) {
      socket.on('connect', () => {
        socket.emit('newUser', { userName:localStorage.getItem('userName'), socketID: socket.id });
      });
    }else{
      navigate('/');
    }
    let timer;
    socket.on('typingResponse', (data) => {
      clearTimeout(timer);
      setTypingStatus(data);
      timer = setTimeout(() => {
        setTypingStatus("");
      }, 1000);
    });
  }, [socket]);

  return (
    <div className="chat">
      <ChatBar socket={socket} />
      <div className="chat__main">
        <ChatBody messages={messages} typingStatus={typingStatus} lastMessageRef={lastMessageRef} />
        <ChatFooter socket={socket} />
      </div>
    </div>
  );
};

export default ChatPage;