import styled from 'styled-components';

const Item = styled.div`
  background: white;
  border: 1px solid ${props => props.theme.offWhite};
  box-shadow: ${props => props.theme.bs};
  position: relative;
  display: flex;
  flex-direction: column;
  img {
    width: 100%;
    height: 400px;
    object-fit: cover;
  }
  p {
    font-size: 12px;
    line-height: 2;
    font-weight: 300;
    flex-grow: 1;
    padding: 0 3rem;
    font-size: 1.5rem;
  }
  .itemTitle {
    background: ${props => props.theme.red};
    transform: rotate(-3deg);
    color: white;
    font-weight: 600;
    padding: 5px;
    line-height: 1;
    font-size: 3rem;
    display: inline-block;
    position: relative;
    top: -23px;
    /* right: -3px; */
    margin: 0 auto;
  }
  .buttonList {
    display: grid;
    width: 100%;
    border-top: 1px solid ${props => props.theme.lightGrey};
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    grid-gap: 1px;
    background: ${props => props.theme.lightGrey};
    & > * {
      background: white;
      border: 0;
      font-size: 1rem;
      padding: 1rem;
    }
  }
`;

export default Item;
