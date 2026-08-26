import API from "../services/api";

function PFOList({ pfos, refreshPFOs }) {

  const handleDelete = async (id) => {

    try {

      await API.delete(`/api/pfo/delete/${id}`);

      refreshPFOs();

    } catch (error) {

      console.log(error);
    }
  };

  return (

    <div className="
      bg-white
      rounded-3xl
      shadow-lg
      p-8
      overflow-x-auto
    ">

      <h2 className="
        text-2xl
        font-bold
        text-green-700
        mb-6
      ">
        All PFO Accounts
      </h2>

      <table className="w-full">

        <thead>

          <tr className="border-b">

            <th className="p-3 text-left">PFO</th>

            <th className="p-3 text-left">Username</th>

            <th className="p-3 text-left">District</th>

            <th className="p-3 text-left">Email</th>

            <th className="p-3 text-left">Action</th>

          </tr>

        </thead>

        <tbody>

          {pfos.map((pfo) => (

            <tr key={pfo.id} className="border-b">

              <td className="p-3">{pfo.pfo_name}</td>

              <td className="p-3">{pfo.username}</td>

              <td className="p-3">{pfo.district}</td>

              <td className="p-3">{pfo.email}</td>

              <td className="p-3">

                <button
                  onClick={() => handleDelete(pfo.id)}
                  className="
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    px-4
                    py-2
                    rounded-lg
                  "
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default PFOList;