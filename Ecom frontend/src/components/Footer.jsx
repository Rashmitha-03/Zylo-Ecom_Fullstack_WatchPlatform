import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

const Footer = () => {
  return (
    <footer className="mt-5 text-dark" style={{ backgroundColor: '#f3ebe1', fontFamily: 'Georgia, serif' ,fontSize: '1.1rem' }}>
      <Container fluid className="pt-4 px-4 px-md-5">
        <Row className="pb-3 gx-3 align-items-start">
          {/* Brand */}
          <Col md={4} className="mb-3">
            <h5 className="fw-bold text-uppercase mb-2" style={{fontSize: '1.5rem'}}>Zylo</h5>
            <p style={{ fontSize: '1.0rem', lineHeight: '1.6' }}>
              Timeless design meets modern minimalism. Explore watches that elevate your everyday.
            </p>
          </Col>

          {/* Quick Links - centered */}
          <Col md={4} className="mb-3 d-flex justify-content-center">
            <div>
            <ul className="list-unstyled small mb-0">
  <li className="py-1">
  <HashLink smooth to="/#about" className="text-dark text-decoration-none">
  About Us
</HashLink>

  </li>
  <li className="py-1">
    <Link to="/faq" className="text-dark text-decoration-none">FAQs</Link>
  </li>
  <li className="py-1">
    <Link to="/products" className="text-dark text-decoration-none">Shop Now</Link>
  </li>
  <li className="py-1">
    <Link to="/contact" className="text-dark text-decoration-none">Contact</Link>
  </li>
  <li className="py-1">
    <Link to="/termscondition" className="text-dark text-decoration-none">Terms & Conditions</Link>
  </li>
</ul>

            </div>
          </Col>

          {/* Follow Us - nudged left */}
          <Col md={4} className="mb-3 ">
            <div>
              <h6 className="text-uppercase mb-2">Follow Us</h6>
              <ul className="list-unstyled small mb-0">
                <li className="py-1"><a href="#" className="text-dark text-decoration-none">Instagram</a></li>
                <li className="py-1"><a href="#" className="text-dark text-decoration-none">Twitter</a></li>
                <li className="py-1"><a href="#" className="text-dark text-decoration-none">Facebook</a></li>
              </ul>
            </div>
          </Col>
        </Row>

        <hr className="border-secondary-subtle mt-0 mb-3" />

        <Row className="align-items-center justify-content-between pb-3 text-center text-md-start">
  <Col xs={12} md="auto" className="text-start">
    <p className="small mb-0">
      &copy; {new Date().getFullYear()} Zylo. All rights reserved.
    </p>
  </Col>
  <Col xs={12} md="auto" className="ms-auto">
    <div className="d-flex justify-content-center justify-content-md-end gap-3">
    <img src="https://tse2.mm.bing.net/th/id/OIP.2ZRufiVfo-p4n0-4dDR5TwHaHa?w=203&h=203&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3" alt="Paytm" height="40" width="55" />
              <img src="data:image/webp;base64,UklGRkwJAABXRUJQVlA4IEAJAABwOQCdASoGAQ4BPp1OokylpKMiJHTYyLATiWVu4XKREZP/pLrdHauQL5Y8M8Mgg3tq8sdQDzBv1O6UXmF86X0v+gB/Ov9L1qnoAeXT7Mf7gftLmIXnH+69wH+p/HLJyeCs83YPtebveADrANRpUnNQ8e/15wGfSAF6Lc+oIfUEPqCH1BD6gh9QQ+oIfUEPqCH1BD6gMDJLDc+oIfHTvKk1evmQVbg53lQ8YYHQ4NThCgfkxVEqqurZEW+xJbieZgzABxwksNzm3J1sbz7olf5u5DdIxA/g61hmW6kocGpwh6nOw5FJwffKPapWTI2iamrTFYA6IkuRwNsDiEJfkiEXgKlLG5MvlBD8p8v5p4S03wnRElvjZ5UpSAvojZRMZlG0BCl9OGiJKUGmbMwu+9hg/K5P6kEPprc3oPrNdHkq1DvcCXYmx79mBSnuhHyVliY1waUyZ00uu08K/qOeCai6VlyD+eMq+6Di9qO5XzWnv9ZrZfupgHlpA2OGXSNnADKYWb68B9aFWQDYybhKQpzK4H3D1zuS2O9Kriay6ohgUcKfEWoV/Hw73kvFkEL8QXmC5ZenThoiS5Naw3PqCH1BD6gh9QQ+oIfUEPqCH1BD6gh9MgAA/v71oAAAD/ehBSlEo/wo/07occ6qgzPjbn9m4o35Zuwr10SyWOBchK/72vAi0o5q1CrSQoOz05UOUao12a+dbFdTRsWs4ERi0mjG3jBilFsj/KJcne2x7QFR5fMhcvwuYrCkkBtPt+SdRL9YTzvTmrtCL90bBYai3QYo0aEER6bwLiEJOFCxlq1/KuPuOg5a9Rv679kZD5PZLOPULesAwZdQRXgb4H5j+TUdOF5SSONiOvJ0QU3i0J0V/WGhwdBJacul/fBaX+825zjovOJ1SIq37iKQN2igTzULd7aECYyTBnmJIu/Josx0Ys/s7tHcwCW6WBXhQl1//xioUJaZQ4Qhh0ubOormOL+7ztHjz+4f086bjhzfdsqqXK4idwq0GbX5aVrpm3q6cCSEVKnOUMlGLCXXAbkIHBojklh47OV+sZsOiZmQPAnuBl1ahqz55aetVr5abFuXn5eGFC8I61sVJTP+xfIW4MpRsdBAgumPB1E4rn33o7njPh5E+AG8FvodJMsIvM8QA96VZCxKcc4lJ/+JsndIykjGJgjbsCbRvOWAD6mkzs69W9siqVasVGDu65pP/Ix/vA934BrPMr8aaC8bKLNHGIl0UyJ0/d4r807vlCgeSS5SLYTMFc6XEuIOH8UvGA5sXNk2PPG4D9CjI5FccS/Fe7Iu/GbcOt6ng7V1bz3AFaTNt5jEZO/LGsWeaV4wCWTotu2uirK0iTKAGHXkVhAAHSZWEfyXVXLwzW9kU//LH8vib4Ze/kiUKJgZqJu/iZ0DCedN97yVaZbBlIihFzgmO/bpj4SfMtb6kcOS/lStApStpOqlV8zpOkb7dksiBRStSiLgtfDxywhyHSOPNyB3U2AXCRH1sk7og55IFNv1BBtEnXOjCawBmX4AH0WKy9XDNtP7eWzSww8i8FYLhblczN0L4Tvjf3ISkSZxfVu4eWzd+/e9+S84B/heyv4XqyY7emyNOyg8kp3OvLbj8++F4cUoPxsqlbs6SkmBy6GiT6UC9umTDjhBVYDACb37kvxM5yJbjt8/0FxCepf+LLMPQL+Fw2nrsMXOf3+n41hXKBWOnolhMRjtUxemMalj/JEwnfjYoaiikdgzn3H36Mhy1KKrwZpGwVwH2tC8lqHpk1QphXwxAFSNQz5If1Ukg0c91QE5LBOl79Twhv1B6O3MrrePRNZ9CLji39bL+GFjkApbb/8+pIb/g0Xjm18l0nQAq/wUx8sJe96M6aIjHthH52Kywlv/lOp7SYBhO550AlXgAQIfviiuRRUu911k/X+1+kdF6pOdXjASWgOzzvgkume0gbzUwPlfpqAS2mwYMvk4e6tA6SFFdOLXG5qgglD5JOj2nB+6VW6IMxXhc7KhEaZ2IraXWzaYI9m6dxUQUHz7XD9STXagDHMQ6dcCNM7NbFk9rKN1clv7PBxsCi2KVcFTCQ0PyIEHGdB/7PrPM+yRyvUZH98XyxompWNB51StMV5DmNPE8oaU+Z9+pFxFZc3XKyxYZ/Odk5aVa/q+6TByYAXCcbj1GKAMuMxF4LroLxcr/PufAGsb0iavMc7b103A91cy7auTRfg8If0tUjg/S1d3Q+r8Fn3cpmPZRyrIWVnsCUJJYph2GhV9FksUpwDqSkYJCRX+FrGw5AHK7mxONXaRLFgbAjcJQlLjKr10we5wIPIcMznEFXAi/GbrGM5mtvTjF/hqaKSt43BzdpJdGLo2QCVW/r+aZrJQ6LEr1vxaoepU1E9QD5n51jwDNZSQ8pYIsxwEtpQ8Gn04dwvL+ZU82e8V+G3HtN4Tf1Aa5TDLvA6+vBVPmyHKOMH8JitTtQlYqC4GFpZi1Xhoj3YVKcfnsia3D6JdUf/492qFo1KqHEsBmOQEOaWMQQLcTwUWji9LyYZyv+skNjSi/8G2y9PmNE/Llw/fwdrGIqyFETCsufYeYMf1idj8Fsz3KngMXXpNi4POiKWd/9oeasgKzw+6HDBTPBud6FWWI8mCXIZtDMIzEoUBUWBKoOiwqCdAq11oNg0qDuIpkSEsrkHypItInY/cQsqifc3TC5GiZE8hMnzK/QwTXgtDK8YMKVmtcPzs5Cm0Ss0MlEZk6mH1Ll+kT7G9BvOQjibvsW8PJQwd7N808799xSNiBM2SzLiqVFDO78uKB5N1EwjZgf1d6RuHqK5s0xp3k/hdpOZcRsGgoXj08zNm4t3fg4U8x8QNCRQXVxKrIcJqFCVXVRSeYs+j+sayXblZQ5V1KEFu1cYUIh0tS+QI4VkCuamnJgDioxThVb3qH6CWBFIp26gBCetSLbTowfsk3rbrmf5WosX7A3OmC0NTyuAZr+8SU7tFDMp0mZpmUNtgmV5sRCD5Kobv1RQKL7VAHSg9oGwijYpPXL9Uh+IbvUAO4IRKASMSlZq+1XlJcJnV/qh9km4EWrrFJbGrBBaCo2ucn8Ss6ZdOUq+lNeUL2Cv/2HwgZH20IePrcG+jmtlX2ZY1xne0VGA/pR3byaLLDb46N7u0TChlocmU65ycEsdvsAAAAAAA" alt="Google Pay" height="40" width="55" />
              <img src="data:image/webp;base64,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" alt="PhonePe" height="40" width="55" />
              <img src="data:image/webp;base64,UklGRv4LAABXRUJQVlA4IPILAABQTACdASqAAQ4BPp1OoU0lpCMiIbM5KLATiWlu4XShARImG9+Xegg9WP6q+oD9jfXY9Hf/Z9P/Jk/Kx1V7yr2W/7Hl0PaflMs19CnZDwAvC28ngC+t3nlfX+ZWlc0APKL/yPJh9bcBn0YxE9xZ3yil7izvlFL3FnfKKXuLO+UUvcWd8ope4s75RS9xZ3yil7izvlFL3FnfKKXuLO+UUvcWd8ope4s75RS9xZ3yil7U14vd6kmeMJtyX0n78rGHYsyZ61Th262Ngsv3lYsPulA4ZQQJLP49rS9gPho/1NZCMIXM2W/hP/756UpoIJsPJwLPZgQCbG49cKIW1gu9n7DvnGyhQR7UrQHRBEACgtNXvXoJwxDNQlsfqTEBqw+uoDnpQiM+j6kwn03Nox3PaKKZ6PWWyjrLthAXnkHnxrAL/fetirsh4maL+iIoQ2ZOjZz5k8aXbHzKM6dQsMc/vnJ/Q3a8t+aIa3pks89cBEWX+hM0x6uy8ff2vSdQ/90r8LVKQLMTAcifoWbRfA2BOEpmvQGP3NwpczYQ1Wbvl6AqWMdUBJXdkGX3bQGTslfc9f8u1wCP7AcsbXNmyxVczkSiA5vTK6Usz3stv/yGt+cMMY3UJqqVw5l43QIojX/gbFDvUicf5dKuwKSutdMAgeF/97/n53ALgKiLsdpbLnEvQtbZGFE95BPpQmk5Q7dLv+VAUnIC1jZn3hVrym60sK2tRDkUrfLO+UUvcWiSRRDizvlFL3FnfKKXuLO+UUvcWd8ope4s75RS9xZ3yil7izvlFL3FnfKKXuLO+UUvcWd8ope4s75RS9xZ3tgAAP7/X0AAAAAAAAAAAANvG9MFMTqwv3HyJlofz/jVG43ATRsbusq1MeDChIoTpfjGRbMIKfDqvlVXiACeyMdn/pgZgBkg3xUnTbMz7ITIfoaRqpCHBsvLveEff448n9NatmFxLOTP7FF1/w1cS0lcDfnVHV6Ku42PnryV1shCnkB5NE/4GByQ+XpNfn3sXKiqAZ6gTVfXPGKRtPY8+09jEoj3ZOFBoN/iOpOSWHr0Jqw0p8PXNlT7d2gM7901VQ1B4S5DVBXBJc1wA6zzGc+ov8pwOil4IZRZEa8cl5R1pVs28BBZK85/wAD21o7eBdDe/+94rHN7vUovlvovh8LCjbTSxyIJlBDomhO7pOmjLW12VX4WERbNHfcwODHarmo/p52PSjwc+Tit20EDGRyZ54yq+C2dXKnpB/yio9Fc1EQhPWEIOehe63pXzdTfBee2s4Swh8YmqTjJPr39DawMq+3cDKQswnK1weiqYfyTbEXaG4Ett/fJINungf72QL8YIEG/TFcC7G9FYgC0rddisndVHsRwufNsFk6aOftC1h/qlYf27psoXXeTiiMfOeEhK7GC+t3C8r0hv80akd2qVJlOHCuhN2aMLM4asC53eMKibvyRS0VGqEASIXxuAFArWIEE4dqJGOCHjFTtk0ZZJKB9KnrH/MXCp+R9ny6yOoJ3nl7aNCbh0ZP/B8T0uVxu2qP326goyqOpHinx2rAD2dxve8l4KUlwPprq8sE9sa2ZKWTnHD/NXct39ffJI9+mxWYsiXiZBbw1zqDAMHTGEDNceCOvKJgokRBxAiJaZjogEf9SrPLstnqvCg/n1kbUNvpWH7sUkqfiZZYJJ1ltjCl6Oa/gq7ZOnuRleVjoxX4nuSPcCOl8c2EBa8I188Iq3zJ2xviKO0Bw/ITGNSmOxvEo+ufSRU9ke0pOXFaRLl5rDVV1zYEl9OONJqGTDPiSG/9uJ9bFGDWYAVJfJDNNlzYinOh51kEY2iHvyLEGOcpqfHav4aTKDRlHTQNRp62pApgfz8e5mmS4EVIKaTbV6rdCoBIkJvEz8OfKrzKk2rAyljJgy0iOlGnfz9tBBp6khslMVQM1FYN+NzygpQQokr2RrxH+bwhhVxCbuN49G1kyOgiY4Lx2mRft7ieWPzR85p2mWjjZyeZQ6+mdOD4m6b1m+a3PtsEGPmzP2cqSR+3K7Qi/W97SErT1jfz+cvUx7NYV3k+EVhDPHz8TKK++kTB4x0u4HS4kdOJ++Q45vKGxkPofNnTdxLJy7dom4HfzWNayr1fGThJeVOqPOKbfszN1yG9gosxd/bdfk7g7jIeZZ/Bss8cZDwHu5C8938OrYkw0L9TC+ZVxsWZcATgIxxVCRSnrgDWlmXK/dWI+5NwaWew1ZWRMJnHKqArDAs24DHCtN/UeCKzyhLOX3ivGNDWkNLbZdKrVFot5AwJC+IIiRYeVMdiwI5IwSpJ2Wk/urTU92cpDsSstgePXe2W349R19RaSl2gS6W4MyzU4+7LBcNMZ8uS6nKYpEX0/lU09Dj861gaIKW2tGaYbyaL9F1oBBNK2NRuDZIFaeTFB6I8LTaRpTjEBaoI0dvwu1wI8qf8+6iaWA9IdBNebn5lRms2uNEfozkPCi14xr/vCiIZ3HK4zEJnGuCUXofEI9kAhZT9HGhWablUT6pQiXKKN3p1WDdx0TRdzlIOjm8j1ohewazz0IC0K/VXUryNLQ8J/FLHb8KEMaBXoWh4ck0DAurzlJAj1VZZzwyRDCm3HKwzdpanjErZG9sS5TdnPhtIjNdJPOxiHI3QMekCo8bRNQQck5lR6jWkraDdIIxuXWLkop1e72GP4M6iEva+ThnZKlr6dNWSElR+zH7kauo1Xh+TgLgbi12ouGJLgBT+uH/bnoagDURFQe27IJtxRRfjbjVQ+bc55LYdXZk+k8VgnnbyJX2T9GUbIR4oludARZsVVh2vyZfcEaExiKw/1pe7il9FwXejhoud3qK0B6p6eFM54fl1IpXk2OBOD9c4bb7mUxaCKgRvC8KmH83Yq0FnlTUMYy4nnz1M2MKVN/LfuZqYbpySdmV6tb7Bb/NOmuwZCS98/TLpm2I7j85uv3/R5W4AbOnmg3UagMjy1EFAl1/Hh/tQh8HraeZoO+uJ5PgLWoWKgEW/+VdOnFbZwCYY70lkYY2vvmiYbD25m9TnpMDZAOuoA70hSDy/aJw/d0kYIL0OFKJq0MyTI7OyGj5UtYFX1EqGYDyn5YTv6urJjyg0HdmtonpZPKkE2PPJiD93/IYJg+QwLJGd2bHU1Og7VByMyrt+4uA4nziJ4KFc1chR49EW3wHnJgI3PfJSixP7/bREsFIkiTdkUAtO9glANlrOInIRYlqcgu3ZXI2rqgREiGsPn55gPUa1bAEq4KBaAfspANgllTjDau6ok9idtZBP4k1OReJkn5lanEFNyMrBU/DCXbs6QB3c9iw9k+375y6vvWWE9bGam5egblGezd4pVm/2rXmj0nGifloPkTeOFDWu6V6KlvFSywf+M6ZI7cY2EYun7Sok6JFvjL+n+Q5qetyP4bTjSt6PqNcypq6HvBpcni9TW5yKJsR2WINNnL+kgrAGAZtkG8IRHCa91s5QSe5Q08jQEZP6g8y5V3q+iwA2XbrkpIQaf4fMGaJbyxrcKgALwFo13o8S+9HrxDpM/xJGGmloiCIddVQlwfj2thPRMJhSiBiy8p2YxN3/5VLG5hCbHtWQ+TPBxEvmeD8aUTESG/lnPnyRnWejP9DFWOBP8xuXOupr+zmf2OtuQMgqWBfj8ecnJ3RtWOymauf/KcDcRWjfpAZH3yL3O395ckjAWJ2BsvQQ6J1d8CVNFZJGU9BLFhHf+turIswzTjNeC/yZP9ZkhPJLPYyURYVjx6UWkGdUjoxfXMe+H/mjfj8RmcTHyeoy/S4naXmrzfnKABskmaKZ90W613RWwzmpKMYvVEKbJv6zfqbtIwKs5RCrDKEWMBZ2bSg7KYqZ9S6C1uT3/8HPsS5kG7EFG94lI2JCqKVcjM+6Uilw1GTpNma2/kk/q1ZSlIP/sv2n1yfHt/FPdpiTBVXi9HOs7xooGDoyeKSndTobTQTYj9HDQA8lDd76GvkgrdepMaW7U+TK6sp04ebWikkqHsxoDlcAr5dvX8l9jOzCLa2Ip/ZJlWoGRAfKgHPdisig360iMwI04bBiZ5f1aT5uUAeWH+tsDMlWrefTeBAAAAAAAAAAAAAAAAAAA" alt="Amazon Pay" height="40" width="55" />
             </div>
  </Col>
</Row>
      </Container>
    </footer>
  );
};

export default Footer;

