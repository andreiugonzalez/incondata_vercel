import React from 'react';

const Privacidad = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-10">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-4xl font-extrabold mb-5 text-gray-900">Política de Privacidad</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">1. Introducción</h2>
          <p className="text-gray-700 leading-relaxed">
            En Faena, valoramos tu privacidad y nos comprometemos a proteger tu información personal. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tu información cuando utilizas nuestros servicios.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">2. Información que Recopilamos</h2>
          <p className="text-gray-700 leading-relaxed">
            Podemos recopilar información personal que nos proporcionas directamente, como tu nombre, dirección de correo electrónico, número de teléfono y cualquier otra información que elijas compartir. También podemos recopilar información automáticamente a través de cookies y tecnologías similares cuando visitas nuestro sitio web.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">3. Uso de la Información</h2>
          <p className="text-gray-700 leading-relaxed">
            Utilizamos la información recopilada para los siguientes propósitos:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed">
            <li>Proporcionar, mantener y mejorar nuestros servicios</li>
            <li>Responder a tus comentarios, preguntas y solicitudes</li>
            <li>Enviar notificaciones técnicas, actualizaciones y mensajes administrativos</li>
            <li>Monitorear y analizar tendencias, uso y actividades en relación con nuestros servicios</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">4. Compartir Información</h2>
          <p className="text-gray-700 leading-relaxed">
            No compartimos tu información personal con terceros, excepto en las siguientes circunstancias:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed">
            <li>Con tu consentimiento</li>
            <li>Para cumplir con leyes o responder a solicitudes legales y procesos legales</li>
            <li>Para proteger los derechos y la propiedad de Faena</li>
            <li>En relación con una fusión, venta de activos de la empresa, financiamiento o adquisición de la totalidad o una parte de nuestro negocio</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">5. Seguridad</h2>
          <p className="text-gray-700 leading-relaxed">
            Tomamos medidas razonables para proteger tu información personal contra pérdida, robo, uso indebido y acceso no autorizado, divulgación, alteración y destrucción.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">6. Tus Derechos</h2>
          <p className="text-gray-700 leading-relaxed">
            Tienes derecho a acceder y actualizar tu información personal, así como a solicitar la eliminación de tu información personal en ciertos casos. Para ejercer estos derechos, por favor contáctanos a través de la información proporcionada a continuación.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">7. Cambios a esta Política</h2>
          <p className="text-gray-700 leading-relaxed">
            Podemos actualizar esta Política de Privacidad de vez en cuando. Te notificaremos sobre cualquier cambio publicando la nueva política en nuestro sitio web. Te recomendamos revisar esta política periódicamente para estar informado sobre cómo protegemos tu información.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">8. Contacto</h2>
          <p className="text-gray-700 leading-relaxed">
            Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos en [correo electrónico de contacto] o en la siguiente dirección: [Dirección de la Empresa].
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacidad;
