import { FormEvent, MutableRefObject, SetStateAction } from 'react';
import { UserAndPassDataType } from './types/types';

type FormType = {
  onSubmitHandler: (e: FormEvent<HTMLFormElement>) => void;
  notUser: boolean;
  nameRef: MutableRefObject<HTMLInputElement | null>;
  dateRef: MutableRefObject<HTMLInputElement | null>;
  setUserData: (value: SetStateAction<UserAndPassDataType>) => void;
  name: string;
};

const Form = ({
  nameRef,
  dateRef,
  notUser,
  onSubmitHandler,
  setUserData,
  name
}: FormType) => {
  return (
    <form className="form" onSubmit={onSubmitHandler}>
      <h2>{name}</h2>
      {notUser && (
        <div className="error">
          <h2>Invalid User Try Again</h2>
        </div>
      )}

      <label htmlFor="name">
        Full Name<span>*</span>
      </label>
      <input
        ref={nameRef}
        onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
        required
        type="text"
        name="name"
        id="name"
      />
      <label htmlFor="date">
        Date Of Birth<span>*</span>
      </label>
      <input
        ref={dateRef}
        onChange={e => setUserData(prev => ({ ...prev, dob: e.target.value }))}
        required
        type="date"
        name="date"
        id="date"
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default Form;
