import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { FormEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaSignOutAlt, FaWpforms } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { IoIosArrowBack, IoMdCloseCircle } from 'react-icons/io';
import { MdOutlineDashboardCustomize } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import './App.scss';
import { auth } from './firebase';
import {
  useCreatePassMutation,
  useGetAllPassQuery,
  useGetUserPassQuery
} from './redux/api/passAPI';
import { getUser, useCreateUserMutation } from './redux/api/userAPI';
import { userExist, userNotExist } from './redux/reducer/userReducer';
import { RootState } from './redux/store';
import { MsgResponse } from './types/apiTypes';
import avatar from '/avatar.jpg';
import { Table as TanstackTable } from './table';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { CustomError, DataType, UserAndPassDataType } from './types/types';
import Loader from './Loader';
import Form from './Form';

function getDate(date: Date) {
  const today = new Date(date);
  const yyyy = today.getFullYear();
  let mm = String(Number(today.getMonth() + 1)); // Months start at 0!
  let dd = String(today.getDate());

  if (Number(dd) < 10) dd = '0' + dd;
  if (Number(mm) < 10) mm = '0' + mm;

  const formattedDate = dd + '-' + mm + '-' + yyyy;
  return formattedDate;
}

const columnHelper = createColumnHelper<DataType>();

const columns = [
  columnHelper.accessor('name', {
    cell: info => info.getValue(),
    header: () => <span>username</span>,
    sortingFn: 'alphanumeric'
  }),
  columnHelper.accessor('dob', {
    cell: info => getDate(info.getValue()),
    header: () => (
      <span className="dob">
        <p>DOB</p>
        <p>(dd-mm-yyyy)</p>
      </span>
    )
  })
];

function App() {
  const { user, loading } = useSelector(
    (state: RootState) => state.userReducer
  );
  const dispatch = useDispatch();

  const [createUser] = useCreateUserMutation();
  const [createPass] = useCreatePassMutation();

  const [userData, setUserData] = useState<UserAndPassDataType>({
    name: '',
    dob: ''
  });
  const [passData, setPassData] = useState<UserAndPassDataType>({
    name: '',
    dob: ''
  });
  const [td, setTd] = useState<DataType[]>([]);
  const [isUser, setIsUser] = useState<boolean>(false);
  const [notUser, setNotUser] = useState<boolean>(false);
  const [imgErr, setImgErr] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [toastId, setToastId] = useState<string>('');
  const [position, setPosition] = useState({
    right: '',
    top: ''
  });

  const nameRef = useRef<HTMLInputElement | null>(null);
  const dateRef = useRef<HTMLInputElement | null>(null);

  const { data, isError, error } = useGetUserPassQuery(userData.dob);
  const {
    data: tableData,
    isLoading,
    isError: tableIsError,
    error: tableError
  } = useGetAllPassQuery(user?._id!);

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (notUser) setNotUser(false);
    if (!data?.success) {
      setNotUser(true);
      if (nameRef.current != null && dateRef.current != null) {
        nameRef.current.value = '';
        dateRef.current.value = '';
      }
      setTimeout(() => {
        setNotUser(false);
      }, 1500);
      return;
    }
    toast.dismiss(toastId);
    setIsUser(true);
  };

  const passOnSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await createPass({ id: user?._id!, passBody: passData });
      if ('data' in res) {
        toast.success(res.data.message);
        if (nameRef.current != null && dateRef.current != null) {
          nameRef.current.value = '';
          dateRef.current.value = '';
        }
      } else {
        const err = res.error as FetchBaseQueryError;
        const { message } = err.data as MsgResponse;
        toast.error(message);
      }
    } catch (error) {
      toast.error(`Something went wrong : ${error}`);
    }
  };

  const handleCLick = () => {
    if (count > 4) return;
    setCount(prev => prev + 1);
    if (count > 3) {
      navigator.clipboard.writeText(`${import.meta.env.VITE_PASSWORD}`);
      setPosition({
        top: `0`,
        right: `0`
      });
      return;
    }
    setPosition(prev => ({
      ...prev,
      top: `${Math.round(Math.random() * 20)}rem`,
      right: `${Math.round(Math.random() * 10)}rem`
    }));
  };

  const onSignInHandler = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: authUser } = await signInWithPopup(auth, provider);
      const res = await createUser({
        _id: authUser.uid,
        email: authUser.email!,
        name: authUser.displayName!,
        photo: authUser.photoURL!,
        role: 'user'
      });
      if ('data' in res) {
        toast.success(res.data.message);
        const data = await getUser(authUser.uid);
        dispatch(userExist(data.user));
        if (data.success && data.user.role === 'user')
          toast.custom(
            t => {
              setToastId(t.id);
              return (
                <div
                  className={`toast ${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  }`}
                >
                  I already told you, You are not an <b>Admin</b>
                  <br />
                  Sorry can't give you the access to Admin Dashboard
                  <IoMdCloseCircle onClick={() => toast.dismiss(t.id)} />
                </div>
              );
            },
            { duration: Infinity }
          );
      } else {
        const err = res.error as FetchBaseQueryError;
        const { message } = err.data as MsgResponse;
        toast.error(message);
        dispatch(userNotExist());
      }
    } catch (error) {
      toast.error('SignIn Failed');
    }
  };

  const onSignOutHandler = async () => {
    try {
      await signOut(auth);
      toast.success('Sign Out Successfully');
      toast.dismiss(toastId);
      setIsFormOpen(false);
    } catch (error) {
      toast.error('SignOut Failed');
    }
  };

  const handleFormOpen = () => {
    setIsFormOpen(!isFormOpen);
  };

  const { top, right } = position;

  const Code = styled.code`
    font-size: 1rem;
    padding: 0.3rem 0.7rem;
    border-radius: 5px;
    cursor: pointer;
    background-color: #6b6b6baa;
    letter-spacing: 0.2rem;
    position: relative;
    &::after {
      content: attr(data-text);
      position: absolute;
      top: 2rem;
      letter-spacing: 0;
      border-radius: 10px;
      border-top-left-radius: 0;
      left: 2rem;
      font-size: 0.8rem;
      padding: 0.2rem 0.3rem;
      width: 100px;
      ${count > 4
        ? ''
        : `
        animation: ani 0.3s linear infinite alternate-reverse;
        `}
      background-color: ${count > 4 ? 'lightgreen' : 'rgb(53, 53, 53)'};
      color: ${count > 4 ? 'black' : 'white'};
    }
    @keyframes ani {
      to {
        top: 2.3rem;
        background-color: rgb(103, 103, 103);
      }
    }
  `;

  useEffect(() => {
    onAuthStateChanged(auth, async user => {
      if (user) {
        const data = await getUser(user.uid);
        dispatch(userExist(data.user));
      } else {
        dispatch(userNotExist());
      }
    });
  }, []);
  useEffect(() => {
    if (tableData) {
      setTd(
        tableData.pass.map(pass => ({
          dob: pass.dob,
          name: pass.name
        }))
      );
    }
  }, [tableData]);

  const pageSize = 2;

  const Table = TanstackTable<DataType, ColumnDef<DataType, any>[]>(
    td,
    columns
  )('Dashboard', pageSize, td.length > pageSize);
  if (tableIsError && user?.role === 'admin')
    toast.error((tableError as CustomError).data.message);
  if (isError) console.log(error);
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          {isUser ? (
            <div className="container pass">
              <IoIosArrowBack
                onClick={() => {
                  setIsUser(false);
                  setPosition({
                    top: `0`,
                    right: `0`
                  });
                }}
              />
              <h3>
                Hello {userData.name.split(' ')[0]}, Here is your <br />
                password :{' '}
                <Code
                  data-text={count > 4 ? 'Copied' : 'Click To Copy'}
                  style={{ right, top }}
                  onClick={handleCLick}
                  className="pass"
                >
                  {import.meta.env.VITE_PASSWORD}
                </Code>
              </h3>
            </div>
          ) : (
            <div className="container">
              {user ? (
                <div
                  className="user"
                  style={
                    user.role === 'admin' ? { marginBottom: '0.5rem' } : {}
                  }
                >
                  <FaSignOutAlt className="signIn" onClick={onSignOutHandler} />
                  <img
                    referrerPolicy="no-referrer"
                    className="user-profile-img"
                    src={
                      user.photo == null || user.photo.length < 1 || imgErr
                        ? avatar
                        : user?.photo
                    }
                    alt={user?.name}
                    onError={() => setImgErr(true)}
                  />
                  <h2>
                    {user.name == null || user.name.length < 1
                      ? 'username'
                      : user.name}
                  </h2>
                  {user?.role === 'admin' && (
                    <>
                      {isFormOpen ? (
                        <FaWpforms
                          className="show-form"
                          onClick={handleFormOpen}
                        />
                      ) : (
                        <MdOutlineDashboardCustomize
                          className="show-form"
                          onClick={handleFormOpen}
                        />
                      )}
                    </>
                  )}
                </div>
              ) : (
                <button className="signIn-btn" onClick={onSignInHandler}>
                  <FcGoogle /> <span>Sign in with Gooooooogle</span>
                </button>
              )}

              {user?.role === 'admin' && isFormOpen ? (
                //@ NOT CHANGED ONLY FOR ADMIN
                <div className="dashboard">
                  {isLoading ? <Loader /> : <div id="table"> {Table}</div>}
                  <Form
                    nameRef={nameRef}
                    dateRef={dateRef}
                    onSubmitHandler={passOnSubmitHandler}
                    setUserData={setPassData}
                    notUser={notUser}
                    name="Pass Form"
                  />
                  <div style={{ height: '100px' }}></div>
                </div>
              ) : (
                <Form
                  nameRef={nameRef}
                  dateRef={dateRef}
                  onSubmitHandler={onSubmitHandler}
                  setUserData={setUserData}
                  notUser={notUser}
                  name={'Enter Details Here'}
                />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default App;
