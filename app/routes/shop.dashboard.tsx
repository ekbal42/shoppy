export default function Dashboard() {
  return (
    <>
      <div className="h-96">
        <div className="flex justify-center items-center h-full">
          <div className="card bg-base-100 w-96 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Shop Identification Details</h2>
              <p className="text-gray-600">
                Please provide your official business name and location
                information. These details will serve as your shops primary
                identifier within our platform.
              </p>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-neutral w-full mt-4"
                  onClick={() =>
                    (
                      document.getElementById(
                        "shop_set_up_modal"
                      ) as HTMLDialogElement
                    )?.showModal()
                  }
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <dialog id="shop_set_up_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                What will be the shp name?
              </legend>
              <input
                type="text"
                className="input w-full"
                placeholder="My Awesome Shop"
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Your shop Locator</legend>
              <input
                type="text"
                className="input w-full"
                placeholder="@my-awesome-shop"
              />
              <p className="label text-wrap">
                E.g. @my-awesome-shop or @my-awesome or @RimiCakeShop.
              </p>
            </fieldset>
            <button className="btn btn-neutral w-full mt-4">Set Up Shop</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
