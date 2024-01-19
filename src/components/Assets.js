import ceremony from "../assets/ceremony.png";

const Assets = () => {
    return (
      <div className="card ann-card dashboard-card">
        <div className="ann-header">
          <h4>Assets</h4>
          {/* <button>SEE ALL</button> */}
        </div>
        <div className="mt-3">
          <ul className="mb-0">
            <li className="mb-2">
              <a
                href="https://www.youtube.com/watch?v=3h0ZXIZvra0"
                target="_blank"
              >
                <div className="d-flex align-items-center gap-2 ann-title">
                <div className="ann-avatar">
                  <img src={ceremony} />
                </div>
                <div className="ann-content">
                  <h5>Learn Azure</h5>
                  {/* <div className="ann-status">
                                <p >Open</p>
                            </div> */}
                </div>
                </div>
              </a>
            </li>

            <li className="mb-2">
              <a
                href="https://www.youtube.com/watch?v=PQsJR8ci3J0"
                target="_blank"
              >
                <div className="d-flex align-items-center gap-2 ann-title">
                <div className="ann-avatar">
                  <img src={ceremony} />
                </div>
                <div className="ann-content">
                  <h5>Learn Git hub</h5>
                  {/* <div className="ann-status">
                                <p >Open</p>
                            </div> */}
                </div>
                </div>
              </a>
            </li>

            <li>
              <a
                href="https://www.youtube.com/watch?v=k1RI5locZE4"
                target="_blank"
              >
                <div className="d-flex align-items-center gap-2 ann-title">
                <div className="ann-avatar">
                  <img src={ceremony} />
                </div>
                <div className="ann-content">
                  <h5>Learn AWS</h5>
                  {/* <div className="ann-status">
                                    <p >Up Coming</p>
                                </div> */}
                </div>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
};

export default Assets;