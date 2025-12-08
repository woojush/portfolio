'use client';

import { useState, useEffect } from 'react';
import { dashboardRepository, type TodoItem } from '@/lib/repositories/dashboardRepository';

export function DashboardTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  
  // Create New Todo State
  const [inputType, setInputType] = useState<'todo' | 'folder'>('todo');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<TodoItem['priority']>('medium');

  const [loading, setLoading] = useState(true);
  
  // Sub-task state
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);
  
  // Add Subtask State (now separate per todo context effectively, but we use one state for the focused input)
  // To handle multiple inputs properly without complex state, we'll store the "pending" subtask title in a map or just one active input
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [newSubTaskPriority, setNewSubTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      const data = await dashboardRepository.getTodos();
      // Ensure data structure compatibility if needed
      setTodos(data);
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTodo(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newTodoTitle.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    try {
      await dashboardRepository.addTodo({
        type: inputType,
        title: newTodoTitle.trim(),
        priority: inputType === 'todo' ? newTodoPriority : undefined,
        completed: false
      });
      setNewTodoTitle('');
      setNewTodoPriority('medium');
      // Keep inputType as is for convenience
      loadTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('추가 중 오류가 발생했습니다.');
    }
  }

  async function handleToggleTodo(id: string, completed: boolean) {
    try {
      await dashboardRepository.updateTodo(id, { completed: !completed });
      loadTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('업데이트 중 오류가 발생했습니다.');
    }
  }

  async function handleDeleteTodo(id: string) {
    try {
      await dashboardRepository.deleteTodo(id);
      loadTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  }

  // Sub-task Handlers
  async function handleAddSubTask(todoId: string) {
    if (!newSubTaskTitle.trim()) return;
    
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const newSubTask = {
      id: crypto.randomUUID(),
      title: newSubTaskTitle.trim(),
      completed: false,
      priority: todo.type === 'folder' ? newSubTaskPriority : undefined // Only folders need prioritized subtasks
    };

    const updatedSubTasks = [...(todo.subTasks || []), newSubTask];

    try {
      await dashboardRepository.updateTodo(todoId, { subTasks: updatedSubTasks });
      setNewSubTaskTitle('');
      setNewSubTaskPriority('medium');
      loadTodos();
    } catch (error) {
      console.error('Error adding sub-task:', error);
      alert('하위 할 일 추가 중 오류가 발생했습니다.');
    }
  }

  async function handleToggleSubTask(todoId: string, subTaskId: string) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo || !todo.subTasks) return;

    const updatedSubTasks = todo.subTasks.map(st => 
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );

    try {
      await dashboardRepository.updateTodo(todoId, { subTasks: updatedSubTasks });
      loadTodos();
    } catch (error) {
      console.error('Error toggling sub-task:', error);
    }
  }

  async function handleDeleteSubTask(todoId: string, subTaskId: string) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo || !todo.subTasks) return;

    const updatedSubTasks = todo.subTasks.filter(st => st.id !== subTaskId);

    try {
      await dashboardRepository.updateTodo(todoId, { subTasks: updatedSubTasks });
      loadTodos();
    } catch (error) {
      console.error('Error deleting sub-task:', error);
    }
  }

  if (loading) return <div className="card-surface p-6 h-full animate-pulse bg-slate-800/50" />;

  return (
    <div className="card-surface p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-slate-100 mb-4">할 일 (Todo)</h2>
      
      {/* Main Input Form */}
      <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
        <div className="flex-1 flex gap-2">
          {/* Type Selector (Todo / Folder) */}
          <div className="relative flex items-center">
            <select
              value={inputType}
              onChange={(e) => setInputType(e.target.value as 'todo' | 'folder')}
              className="h-10 rounded-l border border-r-0 border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 focus:border-slate-500 focus:outline-none appearance-none cursor-pointer pl-2 pr-8 text-center min-w-[70px]"
            >
              <option value="todo">할 일</option>
              <option value="folder">폴더</option>
            </select>
            <div className="absolute right-2.5 pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Priority Selector (Visible only for 'todo') */}
          {inputType === 'todo' && (
            <div className="relative flex items-center">
              <label className="sr-only">우선순위</label>
              <select
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(e.target.value as TodoItem['priority'])}
                className={`h-10 border border-l-0 border-r-0 border-slate-700 bg-slate-900 px-3 text-sm focus:border-slate-500 focus:outline-none appearance-none cursor-pointer pl-8
                  ${newTodoPriority === 'high' ? 'text-red-400' : newTodoPriority === 'medium' ? 'text-yellow-400' : 'text-blue-400'}
                `}
              >
                <option value="high" className="text-red-400">높음</option>
                <option value="medium" className="text-yellow-400">보통</option>
                <option value="low" className="text-blue-400">낮음</option>
              </select>
              <div className={`absolute left-2.5 w-3 h-3 rounded-full pointer-events-none
                ${newTodoPriority === 'high' ? 'bg-red-500' : newTodoPriority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}
              `} />
            </div>
          )}
          
          {/* Title Input */}
          <div className="relative flex-1 flex items-center">
             <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder={inputType === 'folder' ? "폴더 이름..." : "할 일을 입력하세요..."}
              className={`w-full h-10 border border-l-0 border-slate-700 bg-slate-900 pr-3 pl-3 text-sm text-slate-200 focus:border-slate-500 focus:outline-none rounded-r
                ${inputType === 'folder' ? 'border-l' : ''}
              `}
            />
          </div>
        </div>
        <button
          type="submit"
          className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-sm transition-colors whitespace-nowrap"
        >
          추가
        </button>
      </form>

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {todos.length === 0 && (
          <p className="text-center text-slate-500 py-4 text-sm">등록된 할 일이 없습니다.</p>
        )}
        
        {/* Render Folders First (Optional, but usually better organization) or Mixed? Assuming mixed based on creation time for now, or sort? Current repo sorts by createdAt desc. */}
        {todos.map((todo) => (
          <div key={todo.id} className="flex flex-col gap-1">
            
            {/* Folder Item Render */}
            {todo.type === 'folder' ? (
               <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-900/40 overflow-hidden transition-all hover:border-slate-700">
                  {/* Folder Header */}
                  <div 
                    className="flex items-center gap-3 p-3 cursor-pointer bg-slate-900/60 hover:bg-slate-900/80"
                    onClick={() => setExpandedTodoId(expandedTodoId === todo.id ? null : todo.id)}
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-yellow-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    </div>
                    <span className="flex-1 text-sm font-medium text-slate-200">{todo.title}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                      {todo.subTasks ? `${todo.subTasks.filter(st => st.completed).length}/${todo.subTasks.length}` : '0/0'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTodo(todo.id); }}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="폴더 삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <div className={`text-slate-500 transition-transform duration-200 ${expandedTodoId === todo.id ? 'rotate-180' : ''}`}>
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  {/* Folder Content (Subtasks) */}
                  {expandedTodoId === todo.id && (
                    <div className="p-3 bg-slate-950/30 border-t border-slate-800 space-y-2">
                       {/* Subtask List */}
                       {todo.subTasks?.map((subTask) => (
                          <div key={subTask.id} className="flex items-center gap-2 group/sub pl-2">
                            <button
                              onClick={() => handleToggleSubTask(todo.id, subTask.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                subTask.completed
                                  ? 'bg-slate-700 border-slate-600 text-slate-300'
                                  : 'border-slate-600 hover:border-slate-500'
                              }`}
                            >
                              {subTask.completed && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                            </button>
                            
                            {/* Priority Indicator for Subtask */}
                            {subTask.priority && (
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                subTask.priority === 'high' ? 'bg-red-500' : subTask.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`} title={subTask.priority === 'high' ? '높음' : subTask.priority === 'medium' ? '보통' : '낮음'} />
                            )}

                            <span className={`text-xs flex-1 ${subTask.completed ? 'text-slate-600 line-through' : 'text-slate-300'}`}>
                              {subTask.title}
                            </span>
                            <button
                              onClick={() => handleDeleteSubTask(todo.id, subTask.id)}
                              className="text-slate-600 hover:text-red-400 opacity-0 group-hover/sub:opacity-100 transition-all"
                            >
                              ×
                            </button>
                          </div>
                       ))}

                       {/* Add Subtask Input (With Priority) */}
                       <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/50 pl-2">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setNewSubTaskPriority('high')}
                              className={`w-3 h-3 rounded-full transition-all ${newSubTaskPriority === 'high' ? 'bg-red-500 scale-125 ring-2 ring-red-500/30' : 'bg-red-900/50 hover:bg-red-500/50'}`}
                              title="높음"
                            />
                            <button
                              type="button"
                              onClick={() => setNewSubTaskPriority('medium')}
                              className={`w-3 h-3 rounded-full transition-all ${newSubTaskPriority === 'medium' ? 'bg-yellow-500 scale-125 ring-2 ring-yellow-500/30' : 'bg-yellow-900/50 hover:bg-yellow-500/50'}`}
                              title="보통"
                            />
                            <button
                              type="button"
                              onClick={() => setNewSubTaskPriority('low')}
                              className={`w-3 h-3 rounded-full transition-all ${newSubTaskPriority === 'low' ? 'bg-blue-500 scale-125 ring-2 ring-blue-500/30' : 'bg-blue-900/50 hover:bg-blue-500/50'}`}
                              title="낮음"
                            />
                          </div>
                          <input
                            type="text"
                            value={newSubTaskTitle}
                            onChange={(e) => setNewSubTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSubTask(todo.id);
                              }
                            }}
                            placeholder="할 일 추가..."
                            className="flex-1 bg-transparent border-b border-slate-800 text-xs text-slate-300 placeholder-slate-600 focus:border-slate-500 focus:outline-none py-1 ml-1"
                          />
                          <button
                            onClick={() => handleAddSubTask(todo.id)}
                            className="text-xs text-slate-500 hover:text-slate-300 whitespace-nowrap"
                          >
                            추가
                          </button>
                       </div>
                    </div>
                  )}
               </div>
            ) : (
              /* Standard Todo Item Render */
              <div
                className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  todo.completed
                    ? 'bg-slate-900/30 border-slate-800/50 opacity-60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => handleToggleTodo(todo.id, todo.completed)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    todo.completed
                      ? 'bg-slate-700 border-slate-600 text-slate-300'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {todo.completed && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {/* Priority Indicator */}
                    {todo.priority && (
                       <span className={`w-2 h-2 rounded-full ${
                        todo.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                        todo.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                    )}
                    <span className={`text-sm ${todo.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {todo.title}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                  title="삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
