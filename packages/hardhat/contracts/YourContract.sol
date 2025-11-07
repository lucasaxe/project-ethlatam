// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "hardhat/console.sol";

contract YourContract {
    
    // --- Estruturas ---
    struct NGO {
        string name;
        address owner;
        uint256 reputation;
        bool isRegistered;
    }

    struct Post {
        uint256 postId;
        address ngoOwner;
        string contentUrl;
        uint256 likeCount;
        uint256 totalDonated;
    }

    struct PostWithNgoDetails {
        uint256 postId;
        address ngoOwner;
        string contentUrl;
        uint256 likeCount;
        uint256 totalDonated;
        string ngoName;
        uint256 ngoReputation;
    }

    // --- Armazenamento ---
    mapping(address => NGO) public ngos;
    Post[] public allPosts;
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    // --- NOVO ARMAZENAMENTO ---
    // Mapeia um endereço de ONG para uma lista (array) de IDs de posts que ela criou
    mapping(address => uint256[]) public ngoPosts;

    // --- Eventos ---
    event NGORegistered(address indexed ngoAddress, string name);
    event PostCreated(uint256 indexed postId, address indexed ngoAddress, string contentUrl);
    event PostLiked(uint256 indexed postId, address indexed liker, uint256 newLikeCount);
    event PostDonated(uint256 indexed postId, address indexed donator, uint256 amount);
    event NGOProfileUpdated(address indexed ngoAddress, string newName);


    // --- Funções de Leitura ---
    function getPostCount() public view returns (uint256) {
        return allPosts.length;
    }

    function getPostDetails(uint256 _postId) public view returns (PostWithNgoDetails memory) {
        require(_postId < allPosts.length, "Post nao existe");
        
        Post storage post = allPosts[_postId];
        NGO storage ngo = ngos[post.ngoOwner];

        return PostWithNgoDetails({
            postId: post.postId,
            ngoOwner: post.ngoOwner,
            contentUrl: post.contentUrl,
            likeCount: post.likeCount,
            totalDonated: post.totalDonated,
            ngoName: ngo.name,
            ngoReputation: ngo.reputation
        });
    }

    /**
     * @dev [NOVA FUNÇÃO] Retorna todos os IDs de posts criados por uma ONG específica.
     */
    function getNgoPostIds(address _ngoOwner) public view returns (uint256[] memory) {
        return ngoPosts[_ngoOwner];
    }


    // --- Funções de Escrita ---

    function registerNGO(string memory _name) public {
        address _ngoOwner = msg.sender;
        require(!ngos[_ngoOwner].isRegistered, "ONG ja registrada");

        ngos[_ngoOwner] = NGO({
            name: _name,
            owner: _ngoOwner,
            reputation: 0,
            isRegistered: true
        });

        emit NGORegistered(_ngoOwner, _name);
    }

    function updateNGOName(string memory _newName) public {
        address _ngoOwner = msg.sender;
        require(ngos[_ngoOwner].isRegistered, "Voce nao e uma ONG registrada");
        ngos[_ngoOwner].name = _newName;
        emit NGOProfileUpdated(_ngoOwner, _newName);
    }

    function createPost(string memory _contentUrl) public {
        address _ngoOwner = msg.sender;
        require(ngos[_ngoOwner].isRegistered, "Voce nao e uma ONG registrada");

        uint256 _postId = allPosts.length;

        Post memory newPost = Post({
            postId: _postId,
            ngoOwner: _ngoOwner,
            contentUrl: _contentUrl,
            likeCount: 0,
            totalDonated: 0
        });

        allPosts.push(newPost);
        
        // --- NOVO REGISTRO ---
        // Adiciona o ID deste post à lista de posts da ONG
        ngoPosts[_ngoOwner].push(_postId);

        emit PostCreated(_postId, _ngoOwner, _contentUrl);
    }

    function likePost(uint256 _postId) public {
        address _liker = msg.sender;
        require(_postId < allPosts.length, "Post nao existe");
        require(!hasLiked[_postId][_liker], "Voce ja curtiu este post");

        Post storage post = allPosts[_postId];
        NGO storage ngo = ngos[post.ngoOwner];

        hasLiked[_postId][_liker] = true;
        post.likeCount += 1;
        ngo.reputation += 1;

        emit PostLiked(_postId, _liker, post.likeCount);
    }

    function donateToPost(uint256 _postId) public payable {
        require(_postId < allPosts.length, "Post nao existe");
        require(msg.value > 0, "Voce deve enviar alguma quantia");

        Post storage post = allPosts[_postId];
        post.totalDonated += msg.value;
        
        address _ngoOwner = post.ngoOwner;
        (bool success, ) = payable(_ngoOwner).call{value: msg.value}("");
        require(success, "Transferencia falhou");

        emit PostDonated(_postId, msg.sender, msg.value);
    }
}