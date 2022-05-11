import React, { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Axios from 'axios';
import '../css/todolist.css'
import '../css/draggable.css'
import {
	todolistAPI,
  todoCreateTaskAPI,
  todoTaskCheckedAPI,
  todoDeleteTaskAPI,
  todoDeleteAllAPI,
  // todoUpdateTaskAPI,
  todoUpdateAllAPI,
} from '../confix';
// import Elon from '../assets/elon.jpg'

export default function ToDoList() {

    const [todolist, setTodolist] = useState([])
    const [newTask, setNewTask] = useState('')

    useEffect(() => {
      getTodolist();
    }, [])
    
    //To Do List
    const getTodolist = () => {
      Axios.get(todolistAPI, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=UTF-8'
        }
      })
      .then((response) => {
        // console.log(response.data)
        let data = response.data
        // let sortByOrder = data.sort((a, b) => (a.order > b.order) ? 1 : -1)
        setTodolist(data)
      })
      .catch((error) => {
        console.log(error)
      });
    }

    // To Do List Create Task
    const createNewTask = async() => {

      console.log(todolist)
      // Generate order
      if(todolist.length > 0){
        var maxOrder = await todolist.reduce((prev, current) => (prev.order < current.order) ? prev.order : current.order)
      } else {
        var maxOrder = 1
      }

      console.log(maxOrder)

      Axios.post(todoCreateTaskAPI, {
        "task": newTask,
        "checked": false,
        "order": maxOrder + 1
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=UTF-8'
        }
      })
      .then((response) => {
        getTodolist();
        closeAddModal();
      })
      .catch((error) => {
        console.log(error)
        closeAddModal();
      });
    }   

    // To Do List Delete All Task
    const deleteAllTask = () => {
      Axios.delete(todoDeleteAllAPI, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=UTF-8'
        }
      })
      .then((response) => {
        getTodolist();
      })
      .catch((error) => {
        console.log(error)
      });
    }   
    
    // To Do List Delete Task BY ID
    const deleteTask = (dataid) => {
      Axios.delete(todoDeleteTaskAPI + dataid, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=UTF-8'
        }
      })
      .then(async(response) => {
        getTodolist();
      })
      .catch((error) => {
        console.log(error)
      });
    }   

    const handleCheckbox = (e, taskId) => {
      Axios.put(todoTaskCheckedAPI + taskId, {
        "checked": e.target.checked
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=UTF-8'
        }
      })
      .then(async(response) => {
        // getTodolist();
        let objIndex = todolist.findIndex((obj => obj.id == taskId));
        var array1 = [...todolist];
        array1[objIndex].checked = !e.target.checked; 
        setTodolist(array1)
      })
      .catch((error) => {
        console.log(error)
      });
    }

    const [todoModalOpen, setTodoModalOpen] = useState(false)
    const [addModalOpen, setAddModalOpen] = useState(false)

    const handleChangeNewTask = (value) => {
      let RegExpression = /^[0-9a-zA-Z\s]*$/; 
      if(RegExpression.test(value)){
        setNewTask(value)
      }
    }

    const closeAddModal = () => {
      setNewTask('')
      setAddModalOpen(false)
    }


    // Draggable ################################################################
    const [dragStartList, setDragStartList] = useState([])
    const [dragDropList, setDragDropList] = useState([])

    const handleDragStart = (e, data) => {
      setDragStartList(data)
    }

    const handleDragLeave = (e, data) => {
      // e.preventDefault();
      e.target.style.background= 'white'
    }

    const handleDragOver = (e, data) => {
      e.preventDefault()
      e.target.style.background= 'lightgray'
    }

    const handleDragDrop = (e, data) => {
      e.preventDefault();
      e.target.style.background = 'white'
      setDragDropList(data)
    }

    const handleDragEnd = async(e, data) => {
      if(dragStartList.order !== dragDropList.order){
        let setNewTodolist = await todolist.map(data => {
          if(dragStartList.id === data.id){
            return {...data,
              created_date: dragDropList.created_date,
              id: dragDropList.id,
              task: dragDropList.task,
              checked: dragDropList.checked,
            }
          }
  
          if(dragDropList.id === data.id){
            return {...data,
              created_date: dragStartList.created_date,
              id: dragStartList.id,
              task: dragStartList.task,
              checked: dragStartList.checked,
            }
          }
          return data
        })

        console.log(setNewTodolist)

        setTodolist(setNewTodolist)

        const putArr = await setNewTodolist.map((data, index)=> (
          Axios.put(todoUpdateAllAPI,
            {
              "checked": data.checked,
              "created_date":  data.created_date,
              "id": data.id,
              "order": data.order,
              "task": data.task
            },{
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json;charset=UTF-8'
            }
          })
          .then((response) => {
            // console.log(response)
          })
          .catch((error) => {
            console.log(error)
          })
        ))

      }
    }

    const todoTaskModal = () => {

      const filteredArrayLength = todolist.filter(element => element.checked === false).length;

      return(
        <Transition appear show={todoModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeAddModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-500"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Todo Today
                    </Dialog.Title>
                    <div className="my-6 h-80 overflow-auto overflow-x-hidden">
                      {filteredArrayLength > 0 ? (
                        <React.Fragment>
                          {todolist && todolist.map((data, index) => {
                            if(data.checked === false){
                              return(
                                <div key={index} className="mt-4 pl-2 py-2 border rounded-md border-slate-800 bg-slate-800 flex justify-between">
                                  <div className="pl-4 font-semibold text-white">
                                    {`${data.task}`}
                                  </div>
                                </div>
                              )
                            }
                          })}
                        </React.Fragment>
                      ):(
                        <div className="mt-4 pl-2 py-2 border rounded-md border-pink-800 bg-pink-800 flex justify-between">
                          <div className="pl-4 font-semibold italic text-white">
                            Completing Tasks!!
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pr-4 flex justify-end">
                      <button
                        type="button"
                        className="
                          focus:outline-none 
                          inline-flex justify-center 
                          rounded-md border 
                          border-transparent 
                          px-4 
                          py-2 
                          mx-1
                          text-sm 
                          font-medium 
                          text-blue-900 
                          hover:bg-blue-200 
                          focus-visible:ring-2 
                          focus-visible:ring-blue-500 
                          focus-visible:ring-offset-2
                        "
                        onClick={()=>setTodoModalOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )
    }

    const addTaskModal = () => {
      return(
        <Transition appear show={addModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeAddModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-500"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Add Tasks
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        The best to-do lists set you off in the right direction each day 
                        and help you focus on the tasks that are most important.
                        <input
                          type="text"
                          className="
                            form-control
                            block
                            w-full
                            px-2
                            py-2
                            mt-4
                            mb-6
                            text-sm
                            font-normal
                            text-gray-700
                            bg-white 
                            bg-clip-padding
                            border 
                            border-solid 
                            border-gray-300
                            rounded
                            transition
                            ease-in-out
                            m-0
                            focus:text-gray-700 
                            focus:bg-white 
                            focus:border-blue-600 
                            focus:outline-none
                          "
                          id="exampleFormControlInput4"
                          required
                          minLength={1}
                          maxLength={50}
                          value={newTask}
                          onChange={(event) => handleChangeNewTask(event.target.value)}
                        />
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        className="
                          focus:outline-none 
                          inline-flex justify-center 
                          rounded-md border 
                          border-transparent 
                          px-4 
                          py-2 
                          mx-1
                          text-sm 
                          font-medium 
                          text-blue-900 
                          hover:bg-blue-200 
                          focus-visible:ring-2 
                          focus-visible:ring-blue-500 
                          focus-visible:ring-offset-2
                        "
                        onClick={()=>closeAddModal()}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={newTask.length < 1 ? 
                          ("focus:outline-none inline-flex justify-center rounded-md border border-transparent bg-slate-100 px-4 py-2 mx-1 text-sm font-medium text-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2")
                          :
                          ("focus:outline-none inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 mx-1 text-sm font-medium text-blue-900 hover:bg-blue-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2")
                        }
                        disabled={newTask.length < 1}
                        onClick={()=>createNewTask()}
                      >
                        Add
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )
    }

    // const sortByOrder =  (prev, current) => {
    //   if(prev.order > current.order){
    //     return 1
    //   } else {
    //     return -1
    //   }
    // }

    return (
      <div className="h-screen flex items-center justify-center bg-slate-800 ">
        <div className="mx-2xl max-w-md bg-white rounded-xl shadow-md">
          <div className="pt-6 px-8 grid gap-36 grid-cols-2">
            <div className="text-2xl font-bold text-slate-800">
              TODAY
            </div>
            <div className="flex items-center justify-end" onClick={()=>deleteAllTask()}>
              <svg className="h-7 w-7 text-red-500 hover:cursor-pointer" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M19 19h-11l-4 -4a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9 9" />  <path d="M18 12.3l-6.3 -6.3" /></svg>
            </div>
          </div>

          <div className="px-8 text-sm italic">
            {todolist.length} Tasks
          </div>

          <div className="px-8 mt-6 mb-8 mr-2 h-80 overflow-auto">
            {todolist && todolist.map((data, index)=>{
              return(
                <div
                  key={index} 
                  draggable={true}
                  // draggable={!data.checked}
                  onDragStart={(e)=> handleDragStart(e, data)}
                  onDragLeave={(e)=> handleDragLeave(e, data)}
                  onDragOver={(e)=> handleDragOver(e, data)}
                  onDrop={(e)=> handleDragDrop(e, data)}
                  onDragEnd={(e)=> handleDragEnd(e, data)}
                  className="mt-4 pl-2 py-2 border rounded-md border-slate-800 flex justify-between cursor-grab"
                  // className={data.checked === false ? ("mt-4 pl-2 py-2 border rounded-md border-slate-800 flex justify-between cursor-grab"):("mt-4 pl-2 py-2 border rounded-md border-slate-800 flex justify-between")}
                >
                  <div className="flex flex-row"> 
                    <input 
                      type="checkbox" 
                      className="h-5 w-5" 
                      checked={data.checked}
                      // disabled={data.checked}
                      onChange={(e)=>handleCheckbox(e, data.id)}
                    />
                    <p className={data.checked === true ? ("pl-4 italic font-semibold text-slate-800 line-through"):("pl-4 font-semibold text-slate-800")}>
                      {data.task}
                    </p>
                  </div>
                  <div className="flex flex-row">
                    {data.checked === false && (
                      <div className="px-1" onClick={()=>deleteTask(data.id)}>
                        <svg className="w-5 h-5 text-red-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </div>
                    )}
                    {/* <div className="px-1 cursor-grab">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"></path></svg>
                    </div> */}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="py-3 border-t border-gray-300">
            <div className="py-2 px-6 flex justify-between">
              <div className="text-slate-800 hover:cursor-pointer" onClick={()=>setTodoModalOpen(true)}>
                What we have to do?
              </div>
              <div className="font-bold hover:cursor-pointer" onClick={()=>setAddModalOpen(true)}>
                Add
              </div>
            </div>
          </div>

          {todoTaskModal()}  
            
          {addTaskModal()}

        </div>
      </div>
    )
}
