import { useForm } from 'react-hook-form';
import { Header } from '../../components/Header';
import { InputSchedule } from '../../components/InputSchedule';
import style from './EditProfile.module.css';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import imageDefault from '../../assets/do-utilizador_318-159711.avif';
import { FiEdit2 } from 'react-icons/fi';
import { isAxiosError } from 'axios';
import { toast } from 'react-toastify';
import { api } from '../../server';
import { useNavigate } from 'react-router-dom';
interface IFormValues {
  picture: File[];
  name: string;
  email: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
}

interface IData {
  newPassword?: string;
  old_password?: string;
  name?: string;
  avatar_url?: File;
}
export function EditProfile() {
  const schema = yup.object().shape({
    name: yup.string(),
    email: yup.string().email(),
    password: yup.string(),
    newPassword: yup.string(),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'senha devem ser iguais'),
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<IFormValues>({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();
  const [fileUpload, setFileUpload] = useState('');
  const [userId, setUserId] = useState();

  useEffect(() => {

    

    const userStorage = localStorage.getItem('user:semana-heroi');
    const user = userStorage && JSON.parse(userStorage);
    setUserId(user.id);

    const getDataUser = async() => {
      const {data} = await api.get(`/users/${user.id}`);

      setValue('name', data.name);
      setValue('email', data.email);
      setValue('picture', data.avatar_url);
      if(data.avatar_url){
        setFileUpload(`http://localhost:3000/files/${data.avatar_url}`)
      }else{
        setFileUpload(imageDefault);
      }
    }
    getDataUser()

  }, []);

  const submit = handleSubmit(
    async ({ name, email, password, newPassword, confirmPassword, picture }: IFormValues) => {
      const data = new FormData();
      data.append('name', name);
      data.append('email', email);
      data.append('old_password', password || ''); // Adicionando o campo password mesmo que vazio
      data.append('password', newPassword || ''); // Adicionando o campo newPassword mesmo que vazio
      data.append('confirmPassword', confirmPassword || ''); // Adicionando o campo confirmPassword mesmo que vazio
      if (picture && picture.length > 0) {
        data.append('file', picture[0]); // Apenas uma imagem é permitida aqui
      }

      try {
        const result = await api.put(`/users/${userId}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('🚀 ~ file: index.tsx:70 ~ result:', result);
        toast.success('Usuário atualizado com sucesso');
        navigate('/dashboard');
      } catch (error) {
        if (isAxiosError(error)) {
          console.log(error);
          toast.error(error.response?.data.errors.message);
        }
      }
    },
  );

  const handleImage = (files: File[]) => {
    const image = files[0];

    const imageUrl = URL.createObjectURL(image);
    setFileUpload(imageUrl);
  };
  return (
    <div className="container">
      <Header />

      <div className={style.formDiv}>
        <form onSubmit={submit}>
          {fileUpload && (
            <div className={style.fileUpload}>
              <img src={fileUpload} alt="" width={'300px'} />
              <label className={style.imageUpload}>
                <input
                  aria-hidden="true"
                  type="file"
                  {...register('picture', {
                    required: true,
                    onChange: (e) => handleImage(e.target.files),
                  })}
                />
                <FiEdit2 />
              </label>
            </div>
          )}
          <InputSchedule
            placeholder="Nome"
            type="text"
            {...register('name', { required: true })}
            error={errors.name?.message}
          />
          <InputSchedule
            placeholder="Email"
            type="text"
            {...register('email', { required: true })}
            error={errors.email?.message}
          />
          <InputSchedule
            placeholder="Senha Atual"
            type="password"
            {...register('password', { required: true })}
            error={errors.password?.message}
          />

          <InputSchedule
            placeholder="Nova Senha"
            type="password"
            {...register('newPassword', { required: true })}
            error={errors.newPassword?.message}
          />
          <InputSchedule
            placeholder="Confirmar nova senha"
            type="password"
            {...register('confirmPassword', { required: true })}
            error={errors.confirmPassword?.message}
          />
          <div className={style.footer}>
            <button>Cancelar</button>
            <button>Editar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
