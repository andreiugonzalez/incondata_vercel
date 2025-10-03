import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import login from "../services/user";
import toast from "react-hot-toast";
import {
  setUser,
  setLink,
  setRole,
  setToken,
  setUriFolder,
} from "../store/user/user";
import PasswordChangeModalWithCurrent from "@/app/components/change_pwd_temp";
import { useDispatch } from "react-redux";

import {
  updateIsTemporaryPassword,
  loginAndRegisterLoginDetails,
} from "../services/user"; // Asegúrate de tener esta función en tu servicio

import io from "socket.io-client";
import Cookies from "universal-cookie";

import { useEffect } from "react";

import "../dashboard/style/media_query.css";

const { useRouter } = require("next/navigation");

function Login_form() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [checkboxError, setCheckboxError] = useState("");
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // cambiar a false al terminar
  const [temporaryPasswordInfo, setTemporaryPasswordInfo] = useState(null);

  const handlePasswordModalSubmit = async (
    currentPassword,
    newPassword,
    confirmPassword,
  ) => {
    setIsPasswordModalOpen(false);
    //toast.success('Contraseña actualizada exitosamenteeeee');
  };

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const cookies = new Cookies(); // Correcto
    const token = cookies.get("token");

    if (token) {
      const socketInstance = io(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_SOCKET_HOST}`, {
        path: "/login-socket",
        auth: { token }, // Enviar el token en la configuración inicial
      });

      setSocket(socketInstance);

      socketInstance.on("connect", () => {});

      socketInstance.on("connect_error", (err) => {
        console.error("Error de conexión:", err);
        if (err.message === "Authentication error") {
          router.push("/login");
        }
      });

      socketInstance.on("connected-users", (users) => {
        // Manejar la lista de usuarios conectados
      });
    }
  }, [router]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    const newPassword = e.target.value;
    if (newPassword.length < 8) {
      setPasswordError();
    } else {
      setPasswordError(""); // Reinicia el mensaje de error si la longitud es válida
    }
    setPassword(newPassword);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    const newEmail = e.target.value;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Expresión regular para validar el formato del correo con cualquier dominio
    if (newEmail.includes("@")) {
      if (!emailPattern.test(newEmail)) {
        setEmailError(
          "Por favor ingresa un correo electrónico válido (Ejemplo: juan@dominio.cl o juan@dominio.com)",
        );
      } else {
        setEmailError(""); // Reinicia el mensaje de error si el correo es válido
      }
    } else {
      if (newEmail.length < 5) {
        setEmailError("El nombre de usuario debe tener al menos 5 caracteres");
      } else {
        setEmailError(""); // Reinicia el mensaje de error si el nombre de usuario es válido
      }
    }
    setEmail(newEmail);
  };

  const handleCheckboxChange = (e) => {
    setCheckboxChecked(e.target.checked);
    if (e.target.checked) {
      setCheckboxError(""); // Reinicia el mensaje de error si el checkbox está marcado
    }
  };

  const handleContinueClick = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validaciones de campos
    let isValid = true;
    if (!email) {
      setEmailError("Por favor ingrese su correo electrónico");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Por favor ingrese su contraseña");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!checkboxChecked) {
      setCheckboxError(
        "Debe aceptar los Términos de uso y Política de privacidad",
      );
      isValid = false;
    } else {
      setCheckboxError("");
    }

    // Si alguna validación falla, salir de la función
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      // Realiza la solicitud de login
      const response = await login(email, password);
      console.log("Respuesta completa del backend en login:", response); // LOG para depuración
      console.log("Status de la respuesta:", response?.status);
      console.log("StatusCode de la respuesta:", response?.statusCode);
      console.log("Data de la respuesta:", response?.data);
      
      const cookies = new Cookies(); // Crear una instancia correctamente
      const token = cookies.get("token");
      console.log("Token desde cookies:", token);

      // Verificar si la respuesta es exitosa (status 200 o statusCode 200)
      if (response?.status === 200 || response?.statusCode === 200) {
        let user = response?.data?.user;

        // Captura el User-Agent desde el navegador
        const userAgent = navigator.userAgent;

        // Registra los detalles del inicio de sesión, incluyendo el User-Agent
        // Obtener la dirección IP en el frontend
        // COMENTADO TEMPORALMENTE - Esta función está causando que el login se quede cargando
        /*
        const userIp = await fetch("https://api.ipify.org?format=json").then(
          (res) => res.json(),
        );

        // Llamar a la función con la IP obtenida
        await loginAndRegisterLoginDetails(
          email,
          password,
          userAgent,
          userIp?.ip,
        );
        */

        // Verificar si la contraseña ha expirado
        // Solo verificar expiración si passwordExpirationDate no es null y es una fecha válida
        if (user.passwordExpirationDate && user.passwordExpirationDate !== null) {
          const currentDate = new Date();
          const expirationDate = new Date(user.passwordExpirationDate);
          
          // Solo verificar expiración si la fecha es válida
          if (!isNaN(expirationDate.getTime()) && currentDate > expirationDate) {
            // Actualiza isTemporaryPassword si la contraseña ha expirado
            const updateResponse = await updateIsTemporaryPassword(user.id, true);
            if (updateResponse?.statusCode === 200) {
              user.isTemporaryPassword = true; // Asegura que el valor esté actualizado
            }
          }
        }

        // Si el usuario tiene una contraseña temporal Y tiene una fecha de expiración válida, abrir modal para cambiarla
        // Los usuarios con passwordExpirationDate null (como administradores) no deben mostrar el modal
        if (user.isTemporaryPassword && user.passwordExpirationDate && user.passwordExpirationDate !== null) {
          setTemporaryPasswordInfo(user);
          setIsPasswordModalOpen(true);
          return; // Detener la ejecución aquí para abrir el modal y no continuar con el login
        }

        // Limpiar las variables antes de asignar nuevos valores
        dispatch(setUser({}));
        dispatch(setLink(""));
        dispatch(setRole(""));
        dispatch(setToken(""));
        dispatch(setUriFolder(""));

        // Despachar la acción para establecer el usuario
        dispatch(setUser(user));
        dispatch(setToken(response?.data?.token));
        dispatch(setUriFolder(response?.data?.setUriFolder));

        // Asigna el primer documento si existe
        const userDocuments = user.documents;
        if (userDocuments && userDocuments.length > 0) {
          dispatch(setLink(userDocuments[0].link));
        }

        // Asigna el primer rol si existe
        const userRoles = user.roles;
        if (userRoles && userRoles.length > 0) {
          const role = userRoles[0].name;

          dispatch(setRole(role));

          // Redirigir según el rol

          const redirectPath = "/dashboard/dashboardproyect";

          router.push(redirectPath);
        } else {
          console.log("No roles found or roles array is empty");
        }

        // Conectar al socket y enviar el token
        const socket = io(`${process.env.NEXT_PUBLIC_FAENA_BACKEND_SOCKET_HOST}`, {
          path: "/login-socket",
          auth: {
            token: response?.data?.token,
          },
        });

        socket.emit("login", response?.data?.token);

        socket.on("auth_error", (message) => {
          toast.error("Authentication error");
          router.push("/login");
        });
        setIsLoading(false);
      } else if (response?.error) {
        toast.error(response?.error?.message);
        setIsLoading(false);
      } else if (response?.status === "error" && response?.message) {
        toast.error(response.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error en el proceso de login:", error);
      toast.error(
        "Hubo un error en el proceso de login. Por favor, inténtelo de nuevo.",
      );
      setIsLoading(false);
    }
  };

  const handleClickpassword = () => {
    router.push("/account");
  };

  return (
    <div className="flex flex-col md:flex-row max-h-screen w-full">
      <div className="hidden md:block md:flex-1 bg-center bg-cover custom-login-form-user">
        <div className="flex items-center justify-center h-full p-10 text-center text-white">
          {/* Aquí puedes agregar contenido adicional si lo deseas */}
        </div>
      </div>
      <div className="flex items-center justify-center p-4 md:p-6 font-zen-kaku custom-login-1 w-full md:w-auto">
        <div className="w-full h-full max-w-full p-4 md:p-6 bg-white border rounded-lg shadow-md">
          <form onSubmit={handleContinueClick}>
            <div className="h-full w-full max-h-full max-w-full">
              <h3 className="text-lg md:text-xl text-[#635F60] font-semibold font-zen-kaku select-none">
                ¡Bienvenido de nuevo!
              </h3>
              <h1 className="mb-3 md:mb-5 text-2xl md:text-3xl font-bold font-zen-kaku select-none">
                Ingrese a su cuenta
              </h1>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium font-zen-kaku select-none"
                >
                  E-mail 
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  onChange={handleEmailChange}
                  required
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleContinueClick(e);
                  }}
                />
                {emailError && (
                  <span className="mt-2 text-sm text-red-500">
                    {emailError}
                  </span>
                )}
              </div>
              <div className="relative mb-4">
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium select-none font-zen-kaku`}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    onChange={handlePasswordChange}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleContinueClick(e);
                    }}
                  />
                  <span
                    className="absolute transform -translate-y-1/2 cursor-pointer right-3 top-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FontAwesomeIcon
                        icon={faEye}
                        alt="Show password"
                        className="w-5 h-5"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faEyeSlash}
                        alt="Hide password"
                        className="w-5 h-5"
                      />
                    )}
                  </span>
                </div>
                {passwordError && (
                  <p className="mt-2 text-sm text-red-500">{passwordError}</p>
                )}
              </div>
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  id="recordarme"
                  className="w-4 h-4 mt-1 text-indigo-600 border-gray-300 rounded"
                  onChange={handleCheckboxChange}
                />
                <label
                  htmlFor="recordarme"
                  className="ml-2 block text-sm text-[#747778] font-zen-kaku select-none"
                >
                  He leído y acepto los{" "}
                  <a
                    href="/terminos"
                    target="_blank"
                    className="text-indigo-600 underline font-zen-kaku select-none"
                  >
                    Términos de uso
                  </a>{" "}
                  y{" "}
                  <a
                    href="/privacidad"
                    target="_blank"
                    className="text-indigo-600 underline font-zen-kaku select-none"
                  >
                    Política de privacidad
                  </a>
                  .
                </label>
              </div>
              {checkboxError && (
                <span className="mt-2 text-sm text-red-500">
                  {checkboxError}
                </span>
              )}
              <button
                type="submit"
                className="w-full py-3 md:py-4 bg-[#5c7891] text-black rounded-lg shadow-md transition-all ease-linear duration-150 hover:bg-[#597381] focus:outline-none focus:ring-2 focus:ring-[#57831] focus:ring-opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center font-zen-kaku">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Cargando...
                  </div>
                ) : (
                  <span className="text-lg md:text-xl font-semibold font-zen-kaku">
                    Iniciar sesión
                  </span>
                )}
              </button>
              <div className="flex items-center justify-center mt-6">
                <span
                  className="text-sm text-[#635F60] cursor-pointer underline font-bold hover:text-black transition-all ease-linear duration-150 font-zen-kaku select-none"
                  onClick={handleClickpassword}
                >
                  ¿Olvidaste tu contraseña?
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
      <PasswordChangeModalWithCurrent
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordModalSubmit}
        user={temporaryPasswordInfo}
      />
    </div>
  );
}

export default Login_form;
